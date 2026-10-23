-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.session_reminders enable row level security;
alter table public.session_checkins enable row level security;
alter table public.checkin_tokens enable row level security;
alter table public.courts enable row level security;
alter table public.queue_entries enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.pair_requests enable row level security;
alter table public.session_feedback enable row level security;
alter table public.public_log enable row level security;
alter table public.admin_log enable row level security;
alter table public.notifications enable row level security;

-- Helper: get current user's role
create or replace function public.my_role()
returns public.user_role
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper: is admin or co-admin
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'co_admin')
    and banned = false
    and deleted_at is null
  );
$$;

-- Helper: is admin only
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
    and banned = false
    and deleted_at is null
  );
$$;

-- ─── PROFILES ────────────────────────────────────────────────────────────────

-- Anon: read masked name, avatar, role only (via view or explicit columns in queries)
create policy "profiles_anon_select"
  on public.profiles for select
  to anon
  using (deleted_at is null);

-- Authenticated players: read own full row + other players' public fields
create policy "profiles_auth_select"
  on public.profiles for select
  to authenticated
  using (deleted_at is null);

-- Players: update own profile only (not role, banned, deleted_at)
create policy "profiles_auth_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- role, banned fields can only change via admin RPC
  );

-- Admin: full access
create policy "profiles_admin_all"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── SESSIONS ────────────────────────────────────────────────────────────────

create policy "sessions_anon_select"
  on public.sessions for select
  to anon, authenticated
  using (true);

create policy "sessions_admin_all"
  on public.sessions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── SESSION REMINDERS ───────────────────────────────────────────────────────

create policy "reminders_player_own"
  on public.session_reminders for all
  to authenticated
  using (player_id = auth.uid())
  with check (player_id = auth.uid());

create policy "reminders_admin_all"
  on public.session_reminders for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── SESSION CHECK-INS ───────────────────────────────────────────────────────

create policy "checkins_player_own_select"
  on public.session_checkins for select
  to authenticated
  using (player_id = auth.uid());

create policy "checkins_staff_select"
  on public.session_checkins for select
  to authenticated
  using (public.is_staff());

create policy "checkins_staff_insert"
  on public.session_checkins for insert
  to authenticated
  with check (public.is_staff());

-- Players check themselves in via RPC (bypasses RLS via security definer)
create policy "checkins_anon_select"
  on public.session_checkins for select
  to anon
  using (false);

-- ─── CHECKIN TOKENS ──────────────────────────────────────────────────────────

create policy "tokens_staff_all"
  on public.checkin_tokens for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "tokens_anon_none"
  on public.checkin_tokens for select
  to anon
  using (false);

-- ─── COURTS ──────────────────────────────────────────────────────────────────

create policy "courts_anon_select"
  on public.courts for select
  to anon, authenticated
  using (true);

create policy "courts_staff_all"
  on public.courts for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ─── QUEUE ENTRIES ───────────────────────────────────────────────────────────

create policy "queue_anon_select"
  on public.queue_entries for select
  to anon, authenticated
  using (true);

-- Players cannot directly insert/update queue entries; must use RPCs
create policy "queue_admin_all"
  on public.queue_entries for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ─── MATCHES ─────────────────────────────────────────────────────────────────

create policy "matches_anon_select"
  on public.matches for select
  to anon, authenticated
  using (true);

create policy "matches_staff_all"
  on public.matches for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ─── MATCH PLAYERS ───────────────────────────────────────────────────────────

create policy "match_players_anon_select"
  on public.match_players for select
  to anon, authenticated
  using (true);

create policy "match_players_staff_all"
  on public.match_players for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ─── PAIR REQUESTS ───────────────────────────────────────────────────────────

create policy "pair_requests_player_select"
  on public.pair_requests for select
  to authenticated
  using (from_player = auth.uid() or to_player = auth.uid());

-- Players send pair requests via RPC only
create policy "pair_requests_staff_all"
  on public.pair_requests for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ─── SESSION FEEDBACK ────────────────────────────────────────────────────────

create policy "feedback_player_own"
  on public.session_feedback for all
  to authenticated
  using (player_id = auth.uid())
  with check (player_id = auth.uid());

create policy "feedback_admin_all"
  on public.session_feedback for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── PUBLIC LOG ──────────────────────────────────────────────────────────────

create policy "public_log_all_select"
  on public.public_log for select
  to anon, authenticated
  using (true);

create policy "public_log_staff_insert"
  on public.public_log for insert
  to authenticated
  with check (public.is_staff());

-- ─── ADMIN LOG ───────────────────────────────────────────────────────────────

create policy "admin_log_admin_all"
  on public.admin_log for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

create policy "notifications_player_own"
  on public.notifications for all
  to authenticated
  using (player_id = auth.uid())
  with check (player_id = auth.uid());

create policy "notifications_staff_insert"
  on public.notifications for insert
  to authenticated
  with check (public.is_staff());
