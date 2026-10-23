-- ─── VENUE CHECK-IN RPC ──────────────────────────────────────────────────────
-- Players call this to check themselves in using a code or token hash.
-- Validates expiry, session liveness, and prevents double check-in.
create or replace function public.venue_checkin(
  p_session_id uuid,
  p_token       text  -- either the 4-digit code or a signed token hash
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id  uuid := auth.uid();
  v_token_row  public.checkin_tokens%rowtype;
  v_session    public.sessions%rowtype;
begin
  -- Must be authenticated
  if v_player_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- Session must be live
  select * into v_session from public.sessions
  where id = p_session_id and status = 'live';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'session_not_live');
  end if;

  -- Find a valid, unexpired token matching code or hash
  select * into v_token_row
  from public.checkin_tokens
  where session_id = p_session_id
    and expires_at > now()
    and (code = p_token or token_hash = p_token)
  order by created_at desc
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_or_expired_token');
  end if;

  -- Upsert check-in (idempotent)
  insert into public.session_checkins (session_id, player_id, method)
  values (p_session_id, v_player_id, 'qr')
  on conflict (session_id, player_id) do nothing;

  return jsonb_build_object('ok', true);
end;
$$;

-- ─── JOIN QUEUE RPC ──────────────────────────────────────────────────────────
create or replace function public.join_queue(
  p_session_id uuid,
  p_mode       public.queue_mode default 'solo',
  p_partner_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id    uuid := auth.uid();
  v_profile      public.profiles%rowtype;
  v_session      public.sessions%rowtype;
  v_position     numeric;
  v_player_count int;
begin
  if v_player_id is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into v_profile from public.profiles
  where id = v_player_id and banned = false and deleted_at is null;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'profile_not_found');
  end if;

  select * into v_session from public.sessions where id = p_session_id and status = 'live';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'session_not_live');
  end if;

  -- Must be checked in at venue
  if not exists (
    select 1 from public.session_checkins
    where session_id = p_session_id and player_id = v_player_id
  ) then
    return jsonb_build_object('ok', false, 'error', 'not_checked_in');
  end if;

  -- Not already in an active entry
  if exists (
    select 1 from public.queue_entries
    where session_id = p_session_id
      and player_id = v_player_id
      and status not in ('finished', 'left', 'away')
  ) then
    return jsonb_build_object('ok', false, 'error', 'already_in_queue');
  end if;

  -- Count active players toward cap (waiting + assigned + standby + playing + on_break)
  select count(*) into v_player_count
  from public.queue_entries
  where session_id = p_session_id
    and status in ('waiting', 'assigned', 'standby', 'playing', 'on_break', 'waitlist');

  -- Assign next position (max + 1)
  select coalesce(max(queue_position), 0) + 1 into v_position
  from public.queue_entries
  where session_id = p_session_id;

  insert into public.queue_entries (
    session_id, player_id, partner_id, mode, status, queue_position
  ) values (
    p_session_id,
    v_player_id,
    p_partner_id,
    p_mode,
    case when v_player_count >= v_session.max_players then 'waitlist' else 'waiting' end,
    v_position
  );

  return jsonb_build_object(
    'ok', true,
    'status', case when v_player_count >= v_session.max_players then 'waitlist' else 'waiting' end,
    'position', v_position
  );
end;
$$;

-- ─── LEAVE QUEUE RPC ─────────────────────────────────────────────────────────
create or replace function public.leave_queue(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id uuid := auth.uid();
begin
  update public.queue_entries
  set status = 'left'
  where session_id = p_session_id
    and player_id = v_player_id
    and status in ('waiting', 'waitlist');

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_in_queue');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- ─── SEND PAIR REQUEST RPC ───────────────────────────────────────────────────
create or replace function public.send_pair_request(
  p_session_id uuid,
  p_to_player  uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_from uuid := auth.uid();
  v_pending_count int;
begin
  if v_from is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- Max 3 pending outgoing requests
  select count(*) into v_pending_count
  from public.pair_requests
  where from_player = v_from and session_id = p_session_id and status = 'pending';

  if v_pending_count >= 3 then
    return jsonb_build_object('ok', false, 'error', 'too_many_pending');
  end if;

  -- Target must be in session and checked in
  if not exists (
    select 1 from public.session_checkins
    where session_id = p_session_id and player_id = p_to_player
  ) then
    return jsonb_build_object('ok', false, 'error', 'target_not_checked_in');
  end if;

  insert into public.pair_requests (session_id, from_player, to_player)
  values (p_session_id, v_from, p_to_player);

  return jsonb_build_object('ok', true);
end;
$$;

-- ─── RESPOND TO PAIR REQUEST RPC ─────────────────────────────────────────────
create or replace function public.respond_pair_request(
  p_request_id uuid,
  p_accept     boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id uuid := auth.uid();
  v_req       public.pair_requests%rowtype;
begin
  select * into v_req
  from public.pair_requests
  where id = p_request_id and to_player = v_player_id and status = 'pending';

  if not found then
    return jsonb_build_object('ok', false, 'error', 'request_not_found');
  end if;

  update public.pair_requests
  set status = case when p_accept then 'accepted' else 'declined' end,
      resolved_at = now()
  where id = p_request_id;

  -- If accepted: update both queue entries to pair mode
  if p_accept then
    -- Set the later of the two positions as the shared position
    update public.queue_entries qe
    set partner_id = case when player_id = v_req.from_player then v_player_id else v_req.from_player end,
        mode = 'pair',
        queue_position = greatest(
          (select queue_position from public.queue_entries
           where session_id = v_req.session_id and player_id = v_req.from_player),
          (select queue_position from public.queue_entries
           where session_id = v_req.session_id and player_id = v_player_id)
        )
    where session_id = v_req.session_id
      and player_id in (v_req.from_player, v_player_id)
      and status in ('waiting', 'waitlist');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- ─── SPLIT PAIR RPC ──────────────────────────────────────────────────────────
create or replace function public.split_pair(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id uuid := auth.uid();
  v_entry     public.queue_entries%rowtype;
begin
  select * into v_entry
  from public.queue_entries
  where session_id = p_session_id
    and player_id = v_player_id
    and mode = 'pair'
    and status in ('waiting', 'assigned', 'playing');

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_in_pair');
  end if;

  if v_entry.status = 'waiting' then
    -- Immediate split: both become solos at pair's position, side by side
    update public.queue_entries
    set mode = 'solo', partner_id = null, split_pending = false
    where session_id = p_session_id
      and player_id in (v_player_id, v_entry.partner_id);
  else
    -- Deferred split: applies after match ends
    update public.queue_entries
    set split_pending = true
    where session_id = p_session_id
      and player_id in (v_player_id, v_entry.partner_id);
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- ─── MARK PROMPT SEEN RPC (starts 60s requeue timer) ─────────────────────────
create or replace function public.mark_prompt_seen(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id uuid := auth.uid();
begin
  update public.queue_entries
  set prompt_seen_at = coalesce(prompt_seen_at, now()),
      requeue_deadline = coalesce(prompt_seen_at, now()) + interval '60 seconds'
  where session_id = p_session_id
    and player_id = v_player_id
    and status = 'finished'
    and prompt_seen_at is null;

  return jsonb_build_object('ok', true);
end;
$$;

-- ─── REQUEUE RPC ─────────────────────────────────────────────────────────────
create or replace function public.requeue(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id uuid := auth.uid();
  v_session   public.sessions%rowtype;
  v_position  numeric;
  v_count     int;
begin
  select * into v_session from public.sessions where id = p_session_id and status = 'live';
  if not found then
    return jsonb_build_object('ok', false, 'error', 'session_not_live');
  end if;

  -- Count active players
  select count(*) into v_count
  from public.queue_entries
  where session_id = p_session_id
    and status in ('waiting', 'assigned', 'standby', 'playing', 'on_break', 'waitlist');

  select coalesce(max(queue_position), 0) + 1 into v_position
  from public.queue_entries where session_id = p_session_id;

  update public.queue_entries
  set status = case when v_count >= v_session.max_players then 'waitlist' else 'waiting' end,
      queue_position = v_position,
      skip_count = 0,
      mode = case when split_pending then 'solo' else mode end,
      partner_id = case when split_pending then null else partner_id end,
      split_pending = false,
      finished_at = null,
      prompt_seen_at = null,
      checkin_deadline = null,
      break_started_at = null,
      requeue_deadline = null
  where session_id = p_session_id
    and player_id = v_player_id
    and status in ('finished', 'on_break');

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_in_valid_state');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- ─── TAKE BREAK RPC ──────────────────────────────────────────────────────────
create or replace function public.take_break(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id uuid := auth.uid();
begin
  update public.queue_entries
  set status = 'on_break',
      break_started_at = now(),
      requeue_deadline = null,
      prompt_seen_at = null
  where session_id = p_session_id
    and player_id = v_player_id
    and status = 'finished';

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_in_valid_state');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;
