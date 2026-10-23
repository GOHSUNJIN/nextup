-- Sessions
create table public.sessions (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null,
  date                     date not null,
  start_time               timestamptz not null,
  end_time                 timestamptz not null,
  max_players              int not null default 40,
  match_reminder_minutes   int not null default 20,
  status                   public.session_status not null default 'upcoming',
  is_daily_auto            boolean not null default false,
  auto_end_at              timestamptz,
  created_by               uuid references public.profiles(id),
  created_at               timestamptz not null default now()
);
create index sessions_status_date on public.sessions(status, date);

-- Session reminders (players opting in for email day-before)
create table public.session_reminders (
  session_id   uuid references public.sessions(id) on delete cascade,
  player_id    uuid references public.profiles(id) on delete cascade,
  reminded_at  timestamptz,
  primary key (session_id, player_id)
);

-- Venue check-ins
create table public.session_checkins (
  session_id     uuid references public.sessions(id) on delete cascade,
  player_id      uuid references public.profiles(id) on delete cascade,
  checked_in_at  timestamptz not null default now(),
  method         public.checkin_method not null,
  primary key (session_id, player_id)
);
create index session_checkins_session on public.session_checkins(session_id);

-- Rotating QR/code tokens
create table public.checkin_tokens (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  code        char(4) not null,
  token_hash  text not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);
create index checkin_tokens_session_active on public.checkin_tokens(session_id, expires_at);

-- Courts
create table public.courts (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.sessions(id) on delete cascade,
  name              text not null,
  type              public.court_type not null default 'open',
  status            public.court_status not null default 'empty',
  -- pending type/name change (applies from next match)
  next_type         public.court_type,
  next_name         text,
  fill_alert_sent_at timestamptz,
  locked_at         timestamptz,   -- set during end-match lock window
  locked_by         uuid references public.profiles(id),
  created_at        timestamptz not null default now()
);
create index courts_session on public.courts(session_id);
