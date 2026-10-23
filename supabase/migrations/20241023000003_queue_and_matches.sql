-- Queue entries (one per player per session, replaced on rejoin)
create table public.queue_entries (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.sessions(id) on delete cascade,
  player_id         uuid not null references public.profiles(id),
  partner_id        uuid references public.profiles(id),
  mode              public.queue_mode not null default 'solo',
  status            public.queue_status not null default 'waiting',
  joined_at         timestamptz not null default now(),
  -- fractional position allows inserting between existing entries without renumbering
  queue_position    numeric not null,
  skip_count        int not null default 0,
  strike_count      int not null default 0,
  standby_priority  int,
  split_pending     boolean not null default false,
  finished_at       timestamptz,
  prompt_seen_at    timestamptz,
  checkin_deadline  timestamptz,
  break_started_at  timestamptz,
  away_warned_at    timestamptz,
  requeue_deadline  timestamptz,
  -- unique active entry per player per session (deferred so RPCs can swap atomically)
  constraint queue_entries_unique_active
    unique (session_id, player_id)
    deferrable initially deferred
);
create index queue_entries_session_status_pos
  on public.queue_entries(session_id, status, queue_position);
create index queue_entries_player
  on public.queue_entries(player_id, status);

-- Matches
create table public.matches (
  id               uuid primary key default gen_random_uuid(),
  court_id         uuid not null references public.courts(id),
  session_id       uuid not null references public.sessions(id),
  team_a           uuid[] not null,
  team_b           uuid[] not null,
  assigned_at      timestamptz not null default now(),
  started_at       timestamptz,
  ended_at         timestamptz,
  end_committed_at timestamptz,
  undo_deadline    timestamptz,
  score_a          int,
  score_b          int,
  ended_by         uuid references public.profiles(id)
);
create index matches_court on public.matches(court_id);
create index matches_session on public.matches(session_id);

-- Match players (individual rows for easy lookups)
create table public.match_players (
  match_id      uuid references public.matches(id) on delete cascade,
  player_id     uuid references public.profiles(id),
  team          public.match_team not null,
  checked_in_at timestamptz,
  primary key (match_id, player_id)
);
create index match_players_player on public.match_players(player_id);

-- Pair requests
create table public.pair_requests (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.sessions(id) on delete cascade,
  from_player  uuid not null references public.profiles(id),
  to_player    uuid not null references public.profiles(id),
  status       public.pair_request_status not null default 'pending',
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);
create index pair_requests_to_player on public.pair_requests(to_player, status);
create index pair_requests_session on public.pair_requests(session_id, status);
create index pair_requests_from_player on public.pair_requests(from_player, status);

-- Session feedback (post-event)
create table public.session_feedback (
  session_id  uuid references public.sessions(id) on delete cascade,
  player_id   uuid references public.profiles(id),
  rating      public.feedback_rating not null,
  created_at  timestamptz not null default now(),
  primary key (session_id, player_id)
);

-- Public audit log (visible to all players)
create table public.public_log (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid references public.sessions(id),
  actor_id     uuid references public.profiles(id),
  action       text not null,
  target_id    uuid,
  target_name  text,
  reason       text,
  created_at   timestamptz not null default now()
);
create index public_log_session on public.public_log(session_id, created_at desc);

-- Admin-only audit log
create table public.admin_log (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid references public.sessions(id),
  actor_id     uuid references public.profiles(id),
  action       text not null,
  target_id    uuid,
  target_name  text,
  reason       text,
  details      jsonb,
  created_at   timestamptz not null default now()
);
create index admin_log_created on public.admin_log(created_at desc);

-- Notifications (track push/email delivery)
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references public.profiles(id) on delete cascade,
  session_id  uuid references public.sessions(id),
  type        text not null,
  payload     jsonb,
  sent_at     timestamptz,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_player on public.notifications(player_id, read_at);
