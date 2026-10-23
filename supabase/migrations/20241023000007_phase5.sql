-- ─── Phase 5: After-match timer, standby, waitlist, session end, push ────────

-- Add ended_at to sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS ended_at timestamptz;

-- Ensure requeue_deadline exists (already used by mark_prompt_seen RPC)
ALTER TABLE public.queue_entries ADD COLUMN IF NOT EXISTS requeue_deadline timestamptz;

-- Add 'ended' to session_status enum
DO $$ BEGIN
  ALTER TYPE public.session_status ADD VALUE IF NOT EXISTS 'ended';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint    text NOT NULL,
  p256dh      text NOT NULL,
  auth_key    text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(player_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "players_manage_own_push"
    ON public.push_subscriptions FOR ALL TO authenticated
    USING (player_id = auth.uid()) WITH CHECK (player_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Avatars storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
DO $$ BEGIN
  CREATE POLICY "avatars_public_read"
    ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "avatars_auth_upload"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "avatars_auth_update"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ─── end_session RPC ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.end_session(p_session_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ) THEN
    RETURN jsonb_build_object('error', 'not_authorized');
  END IF;

  UPDATE sessions SET status = 'ended', ended_at = now()
  WHERE id = p_session_id AND status = 'live';
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'session_not_live'); END IF;

  -- Wind down queue entries
  UPDATE queue_entries SET status = 'left'
  WHERE session_id = p_session_id
    AND status IN ('waiting', 'assigned', 'standby', 'waitlist', 'on_break', 'away');

  UPDATE queue_entries
  SET status = 'finished', finished_at = COALESCE(finished_at, now())
  WHERE session_id = p_session_id AND status = 'playing';

  -- Clear courts
  UPDATE courts SET status = 'empty'
  WHERE session_id = p_session_id AND status IN ('assigned', 'playing');

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── fill_courts (updated with standby marking) ───────────────────────────────
CREATE OR REPLACE FUNCTION public.fill_courts(p_session_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_court_id    uuid;
  v_players     uuid[];
  v_match_id    uuid;
  v_standby_ids uuid[];
BEGIN
  -- Clear any existing standby back to waiting before reassignment
  UPDATE queue_entries SET status = 'waiting'
  WHERE session_id = p_session_id AND status = 'standby';

  -- Fill each empty court with 4 waiting players
  FOR v_court_id IN
    SELECT id FROM courts
    WHERE session_id = p_session_id AND status = 'empty'
    ORDER BY name
  LOOP
    SELECT array_agg(player_id ORDER BY queue_position)
    INTO v_players
    FROM (
      SELECT player_id, queue_position FROM queue_entries
      WHERE session_id = p_session_id AND status = 'waiting'
      ORDER BY queue_position LIMIT 4
    ) t;

    IF v_players IS NOT NULL AND array_length(v_players, 1) = 4 THEN
      INSERT INTO matches (court_id, session_id, team_a, team_b)
      VALUES (v_court_id, p_session_id,
              ARRAY[v_players[1], v_players[2]],
              ARRAY[v_players[3], v_players[4]])
      RETURNING id INTO v_match_id;

      INSERT INTO match_players (match_id, player_id, team)
      VALUES
        (v_match_id, v_players[1], 'a'),
        (v_match_id, v_players[2], 'a'),
        (v_match_id, v_players[3], 'b'),
        (v_match_id, v_players[4], 'b');

      UPDATE queue_entries
      SET status = 'assigned', checkin_deadline = now() + interval '3 minutes'
      WHERE session_id = p_session_id AND player_id = ANY(v_players) AND status = 'waiting';

      UPDATE courts SET status = 'assigned' WHERE id = v_court_id;
    END IF;
  END LOOP;

  -- Mark the next 4 waiting players as standby (on deck)
  SELECT array_agg(player_id ORDER BY queue_position)
  INTO v_standby_ids
  FROM (
    SELECT player_id, queue_position FROM queue_entries
    WHERE session_id = p_session_id AND status = 'waiting'
    ORDER BY queue_position LIMIT 4
  ) t;

  IF v_standby_ids IS NOT NULL AND array_length(v_standby_ids, 1) > 0 THEN
    UPDATE queue_entries
    SET status = 'standby', standby_priority = queue_position
    WHERE session_id = p_session_id
      AND player_id = ANY(v_standby_ids)
      AND status = 'waiting';
  END IF;
END;
$$;

-- ─── handle_no_shows: cancel expired assignments ──────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_no_shows(p_session_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_match_rec  RECORD;
  v_player_rec RECORD;
  v_position   numeric;
  v_count      int := 0;
BEGIN
  FOR v_match_rec IN
    SELECT DISTINCT m.id AS match_id, m.court_id
    FROM matches m
    JOIN queue_entries qe ON qe.session_id = m.session_id
    JOIN match_players mp ON mp.player_id = qe.player_id AND mp.match_id = m.id
    WHERE m.session_id = p_session_id
      AND m.started_at IS NULL
      AND qe.status = 'assigned'
      AND qe.checkin_deadline < now()
      AND mp.checked_in_at IS NULL
  LOOP
    FOR v_player_rec IN
      SELECT mp.player_id, mp.checked_in_at, qe.strike_count
      FROM match_players mp
      JOIN queue_entries qe
        ON qe.player_id = mp.player_id AND qe.session_id = p_session_id
      WHERE mp.match_id = v_match_rec.match_id
    LOOP
      SELECT COALESCE(MAX(queue_position), 0) + 1 INTO v_position
      FROM queue_entries WHERE session_id = p_session_id;

      IF v_player_rec.checked_in_at IS NOT NULL THEN
        -- Innocent bystander — back to waiting without strike
        UPDATE queue_entries
        SET status = 'waiting', queue_position = v_position, checkin_deadline = null
        WHERE session_id = p_session_id AND player_id = v_player_rec.player_id;
      ELSIF v_player_rec.strike_count >= 2 THEN
        -- Third strike → away
        UPDATE queue_entries
        SET status = 'away', strike_count = strike_count + 1, checkin_deadline = null
        WHERE session_id = p_session_id AND player_id = v_player_rec.player_id;
      ELSE
        UPDATE queue_entries
        SET status = 'waiting', strike_count = strike_count + 1,
            queue_position = v_position, checkin_deadline = null
        WHERE session_id = p_session_id AND player_id = v_player_rec.player_id;
      END IF;
    END LOOP;

    DELETE FROM match_players WHERE match_id = v_match_rec.match_id;
    DELETE FROM matches WHERE id = v_match_rec.match_id;
    UPDATE courts SET status = 'empty' WHERE id = v_match_rec.court_id;
    v_count := v_count + 1;
  END LOOP;

  IF v_count > 0 THEN PERFORM fill_courts(p_session_id); END IF;

  RETURN jsonb_build_object('success', true, 'handled', v_count);
END;
$$;

-- ─── promote_waitlist: called when players leave ──────────────────────────────
CREATE OR REPLACE FUNCTION public.promote_waitlist(p_session_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_session      public.sessions%rowtype;
  v_active_count int;
  v_slots        int;
BEGIN
  SELECT * INTO v_session FROM sessions WHERE id = p_session_id AND status = 'live';
  IF NOT FOUND THEN RETURN; END IF;

  SELECT count(*) INTO v_active_count FROM queue_entries
  WHERE session_id = p_session_id
    AND status IN ('waiting', 'assigned', 'standby', 'playing', 'on_break');

  v_slots := v_session.max_players - v_active_count;
  IF v_slots <= 0 THEN RETURN; END IF;

  UPDATE queue_entries SET status = 'waiting'
  WHERE id IN (
    SELECT id FROM queue_entries
    WHERE session_id = p_session_id AND status = 'waitlist'
    ORDER BY queue_position LIMIT v_slots
  );
END;
$$;
