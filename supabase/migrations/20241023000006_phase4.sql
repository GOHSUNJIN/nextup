-- validate_checkin_code: player calls to check in at venue
CREATE OR REPLACE FUNCTION public.validate_checkin_code(
  p_session_id uuid,
  p_code text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM sessions WHERE id = p_session_id AND status = 'live') THEN
    RETURN jsonb_build_object('success', false, 'error', 'session_not_live');
  END IF;

  -- Already checked in → success
  IF EXISTS (SELECT 1 FROM session_checkins WHERE session_id = p_session_id AND player_id = auth.uid()) THEN
    RETURN jsonb_build_object('success', true);
  END IF;

  -- Validate code
  IF NOT EXISTS (
    SELECT 1 FROM checkin_tokens
    WHERE session_id = p_session_id AND code = p_code AND expires_at > now()
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_or_expired_code');
  END IF;

  INSERT INTO session_checkins (session_id, player_id, method)
  VALUES (p_session_id, auth.uid(), 'code')
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- rotate_checkin_token: admin calls to get a fresh 60-second code
CREATE OR REPLACE FUNCTION public.rotate_checkin_token(
  p_session_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_token_id uuid;
  v_expires_at timestamptz;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ) THEN
    RETURN jsonb_build_object('error', 'not_authorized');
  END IF;

  v_code := LPAD(FLOOR(random() * 10000)::int::text, 4, '0');
  v_expires_at := now() + interval '60 seconds';

  DELETE FROM checkin_tokens WHERE session_id = p_session_id AND expires_at < now();

  INSERT INTO checkin_tokens (session_id, code, token_hash, expires_at)
  VALUES (p_session_id, v_code, encode(gen_random_bytes(16), 'hex'), v_expires_at)
  RETURNING id INTO v_token_id;

  RETURN jsonb_build_object('code', v_code, 'token_id', v_token_id, 'expires_at', v_expires_at);
END;
$$;

-- fill_courts: assign waiting players to empty courts (4 per court)
CREATE OR REPLACE FUNCTION public.fill_courts(
  p_session_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_court_id uuid;
  v_players uuid[];
  v_match_id uuid;
BEGIN
  FOR v_court_id IN
    SELECT id FROM courts
    WHERE session_id = p_session_id AND status = 'empty'
    ORDER BY name
  LOOP
    SELECT array_agg(player_id ORDER BY queue_position)
    INTO v_players
    FROM (
      SELECT player_id, queue_position
      FROM queue_entries
      WHERE session_id = p_session_id AND status = 'waiting'
      ORDER BY queue_position
      LIMIT 4
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
END;
$$;

-- start a session (admin only, via RPC)
CREATE OR REPLACE FUNCTION public.start_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ) THEN
    RETURN jsonb_build_object('error', 'not_authorized');
  END IF;

  UPDATE sessions SET status = 'live' WHERE id = p_session_id AND status = 'upcoming';
  RETURN jsonb_build_object('success', true);
END;
$$;
