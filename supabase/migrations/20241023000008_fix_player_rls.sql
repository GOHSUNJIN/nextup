-- Fix: players could not write their own queue entries or check into matches
-- because no player-specific write policies existed on queue_entries or match_players.

-- Allow players to insert/update their own queue entries
DO $$ BEGIN
  CREATE POLICY "queue_player_own"
    ON public.queue_entries FOR ALL TO authenticated
    USING (player_id = auth.uid())
    WITH CHECK (player_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Allow players to update their own match check-in status
DO $$ BEGIN
  CREATE POLICY "match_players_player_checkin"
    ON public.match_players FOR UPDATE TO authenticated
    USING (player_id = auth.uid())
    WITH CHECK (player_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null;
END $$;
