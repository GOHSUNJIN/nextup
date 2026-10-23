-- Seed data for local development
-- Run with: supabase db reset
-- Creates: 30 players (mixed genders/tiers), 3 walk-ins, 1 live session, 2 upcoming, 1 past

-- ─── ADMIN USER ──────────────────────────────────────────────────────────────
-- Insert a test admin directly into auth.users (local only)
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000001',
  'admin@nextup.test',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '{"name":"Alex Admin"}'::jsonb
) on conflict do nothing;

update public.profiles set role = 'admin', gender = 'male', gender_verified = true,
  verified_tier = 'strong', skill_tier = 'strong', email_verified = true,
  pdpa_consent_at = now()
where id = '00000000-0000-0000-0000-000000000001';

-- ─── CO-ADMIN ─────────────────────────────────────────────────────────────────
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000002',
  'coadmin@nextup.test',
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '{"name":"Sam Staff"}'::jsonb
) on conflict do nothing;

update public.profiles set role = 'co_admin', gender = 'female', gender_verified = true,
  verified_tier = 'casual', skill_tier = 'casual', email_verified = true,
  pdpa_consent_at = now()
where id = '00000000-0000-0000-0000-000000000002';

-- ─── 28 PLAYERS ───────────────────────────────────────────────────────────────
do $$
declare
  v_names text[] := array[
    'Jordan Lee','Taylor Kim','Morgan Chen','Riley Park','Casey Tan',
    'Jamie Wong','Quinn Zhang','Avery Lim','Blake Ng','Drew Ong',
    'Reese Goh','Skyler Toh','Finley Koh','Sage Yeo','River Chua',
    'Rowan Wee','Peyton Sim','Logan Tay','Hayden Low','Cameron Chia',
    'Emerson Ang','Dakota Lau','Jordan Kwan','Bowie Soh','Indie Chan',
    'Rebel Yap','Nova Teo','Zion Leong'
  ];
  v_genders text[] := array[
    'male','female','male','female','male',
    'female','male','female','male','female',
    'male','female','male','female','male',
    'female','male','female','male','female',
    'male','female','male','female','female',
    'male','female','male'
  ];
  v_tiers text[] := array[
    'strong','casual','strong','casual','strong',
    'casual','strong','casual','strong','casual',
    'strong','casual','casual','casual','strong',
    'strong','casual','casual','strong','casual',
    'strong','casual','casual','strong','casual',
    'strong','casual','strong'
  ];
  v_uid uuid;
  v_idx int;
begin
  for v_idx in 1..28 loop
    v_uid := ('00000000-0000-0000-0001-' || lpad(v_idx::text, 12, '0'))::uuid;

    insert into auth.users (
      id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
      raw_user_meta_data
    ) values (
      v_uid,
      lower(replace(v_names[v_idx], ' ', '.')) || '@test.com',
      crypt('password123', gen_salt('bf')),
      now(), now(), now(),
      jsonb_build_object('name', v_names[v_idx])
    ) on conflict do nothing;

    update public.profiles
    set
      gender = v_genders[v_idx]::public.gender_type,
      gender_verified = true,
      skill_tier = v_tiers[v_idx]::public.skill_tier,
      verified_tier = v_tiers[v_idx]::public.skill_tier,
      email_verified = true,
      pdpa_consent_at = now()
    where id = v_uid;
  end loop;
end;
$$;

-- ─── SESSIONS ─────────────────────────────────────────────────────────────────

-- 1. Live session (tonight)
insert into public.sessions (id, name, date, start_time, end_time, max_players,
  match_reminder_minutes, status, created_by)
values (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Friday Night Pickleball',
  current_date,
  (current_date + time '19:00') at time zone 'Asia/Singapore',
  (current_date + time '22:00') at time zone 'Asia/Singapore',
  30, 20, 'live',
  '00000000-0000-0000-0000-000000000001'
);

-- 2. Upcoming (tomorrow)
insert into public.sessions (id, name, date, start_time, end_time, max_players,
  match_reminder_minutes, status, created_by)
values (
  'aaaaaaaa-0000-0000-0000-000000000002',
  'Saturday Morning Session',
  current_date + 1,
  ((current_date + 1) + time '09:00') at time zone 'Asia/Singapore',
  ((current_date + 1) + time '12:00') at time zone 'Asia/Singapore',
  24, 20, 'upcoming',
  '00000000-0000-0000-0000-000000000001'
);

-- 3. Upcoming (next week)
insert into public.sessions (id, name, date, start_time, end_time, max_players,
  match_reminder_minutes, status, created_by)
values (
  'aaaaaaaa-0000-0000-0000-000000000003',
  'Sunday Ladder Play',
  current_date + 7,
  ((current_date + 7) + time '14:00') at time zone 'Asia/Singapore',
  ((current_date + 7) + time '18:00') at time zone 'Asia/Singapore',
  40, 20, 'upcoming',
  '00000000-0000-0000-0000-000000000001'
);

-- 4. Past session (yesterday)
insert into public.sessions (id, name, date, start_time, end_time, max_players,
  match_reminder_minutes, status, created_by)
values (
  'aaaaaaaa-0000-0000-0000-000000000004',
  'Thursday Evening',
  current_date - 1,
  ((current_date - 1) + time '19:00') at time zone 'Asia/Singapore',
  ((current_date - 1) + time '22:00') at time zone 'Asia/Singapore',
  24, 20, 'ended',
  '00000000-0000-0000-0000-000000000001'
);

-- ─── COURTS (for live session) ────────────────────────────────────────────────
insert into public.courts (id, session_id, name, type, status) values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Court 1', 'open', 'playing'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Court 2', 'open', 'playing'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Court 3', 'women', 'empty'),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'Court 4', 'mixed', 'empty');

-- ─── CURRENT QR TOKEN ─────────────────────────────────────────────────────────
insert into public.checkin_tokens (session_id, code, token_hash, expires_at)
values (
  'aaaaaaaa-0000-0000-0000-000000000001',
  '7429',
  encode(sha256(('aaaaaaaa-0000-0000-0000-000000000001' || '7429' ||
    extract(epoch from now())::text)::bytea), 'hex'),
  now() + interval '60 seconds'
);

-- ─── CHECK-INS & QUEUE ENTRIES (live session) ─────────────────────────────────
do $$
declare
  v_session_id uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_player_ids uuid[];
  v_uid uuid;
  v_idx int;
  v_pos numeric;
begin
  -- Collect first 20 player ids
  select array_agg(id order by created_at) into v_player_ids
  from public.profiles
  where role = 'player' and is_walk_in = false
  limit 20;

  -- Check them all in
  foreach v_uid in array v_player_ids loop
    insert into public.session_checkins (session_id, player_id, method)
    values (v_session_id, v_uid, 'qr')
    on conflict do nothing;
  end loop;

  -- Add first 8 to queue as 'waiting' (solos and a pair)
  for v_idx in 1..8 loop
    v_uid := v_player_ids[v_idx];
    v_pos := v_idx::numeric;
    insert into public.queue_entries (
      session_id, player_id, mode, status, queue_position, skip_count
    ) values (
      v_session_id, v_uid,
      case when v_idx in (3,4) then 'pair' else 'solo' end,
      'waiting',
      v_pos, 0
    ) on conflict do nothing;
  end loop;

  -- Set partner_ids for the pair (players 3 and 4)
  update public.queue_entries
  set partner_id = v_player_ids[4]
  where session_id = v_session_id and player_id = v_player_ids[3];

  update public.queue_entries
  set partner_id = v_player_ids[3]
  where session_id = v_session_id and player_id = v_player_ids[4];

  -- Put players 9-12 in 'playing' status (on courts 1 and 2)
  for v_idx in 9..12 loop
    v_uid := v_player_ids[v_idx];
    insert into public.queue_entries (
      session_id, player_id, mode, status, queue_position, skip_count
    ) values (
      v_session_id, v_uid, 'solo', 'playing', 100 + v_idx, 0
    ) on conflict do nothing;
  end loop;
end;
$$;

-- ─── 3 WALK-INS ───────────────────────────────────────────────────────────────
do $$
declare
  v_session_id uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_walkin_ids uuid[] := array[
    'cccccccc-0000-0000-0000-000000000001'::uuid,
    'cccccccc-0000-0000-0000-000000000002'::uuid,
    'cccccccc-0000-0000-0000-000000000003'::uuid
  ];
  v_walkin_names text[] := array['Walk-in Wei', 'Walk-in Mei', 'Walk-in Ali'];
  v_walkin_genders text[] := array['male', 'female', 'male'];
  v_uid uuid;
  v_idx int;
begin
  for v_idx in 1..3 loop
    v_uid := v_walkin_ids[v_idx];

    -- Walk-ins have no auth.users row - insert profile directly
    insert into public.profiles (id, name, gender, gender_verified, role, is_walk_in, email_verified, pdpa_consent_at)
    values (
      v_uid,
      v_walkin_names[v_idx],
      v_walkin_genders[v_idx]::public.gender_type,
      true,
      'player',
      true,
      true,
      now()
    ) on conflict do nothing;

    -- Auto check-in (admin-added walk-ins are always at venue)
    insert into public.session_checkins (session_id, player_id, method)
    values (v_session_id, v_uid, 'admin')
    on conflict do nothing;

    -- Add to queue
    insert into public.queue_entries (
      session_id, player_id, mode, status, queue_position
    ) values (
      v_session_id, v_uid, 'solo', 'waiting', 20 + v_idx
    ) on conflict do nothing;
  end loop;
end;
$$;

-- ─── MATCHES (courts 1 and 2 currently playing) ───────────────────────────────
do $$
declare
  v_session_id uuid := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_players uuid[];
  v_match_id uuid;
begin
  select array_agg(id order by created_at) into v_players
  from public.profiles
  where role = 'player' and is_walk_in = false
  limit 12;

  -- Court 1 match (players 9-12)
  v_match_id := gen_random_uuid();
  insert into public.matches (id, court_id, session_id, team_a, team_b, assigned_at, started_at)
  values (
    v_match_id,
    'bbbbbbbb-0000-0000-0000-000000000001',
    v_session_id,
    array[v_players[9], v_players[10]],
    array[v_players[11], v_players[12]],
    now() - interval '15 minutes',
    now() - interval '14 minutes'
  );

  insert into public.match_players (match_id, player_id, team, checked_in_at) values
    (v_match_id, v_players[9],  'a', now() - interval '14 minutes'),
    (v_match_id, v_players[10], 'a', now() - interval '14 minutes'),
    (v_match_id, v_players[11], 'b', now() - interval '14 minutes'),
    (v_match_id, v_players[12], 'b', now() - interval '14 minutes');
end;
$$;
