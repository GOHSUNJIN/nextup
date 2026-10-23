-- Enums
create type public.user_role as enum ('player', 'co_admin', 'admin');
create type public.gender_type as enum ('male', 'female');
create type public.skill_tier as enum ('casual', 'strong');
create type public.session_status as enum ('upcoming', 'live', 'ended');
create type public.court_type as enum ('open', 'strong', 'casual', 'women', 'mixed');
create type public.court_status as enum ('empty', 'assigned', 'playing', 'paused');
create type public.queue_status as enum (
  'waiting', 'assigned', 'standby', 'playing',
  'finished', 'on_break', 'away', 'waitlist', 'left'
);
create type public.queue_mode as enum ('solo', 'pair');
create type public.checkin_method as enum ('qr', 'code', 'admin');
create type public.pair_request_status as enum ('pending', 'accepted', 'declined', 'cancelled');
create type public.match_team as enum ('a', 'b');
create type public.feedback_rating as enum ('great', 'okay', 'not_great');

-- Profiles (extends auth.users)
create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  name               text not null,
  gender             public.gender_type,
  gender_verified    boolean not null default false,
  role               public.user_role not null default 'player',
  dupr_username      text,
  dupr_rating        numeric(4,2),
  dupr_verified      boolean not null default false,
  phone              text unique,
  email              text unique,
  email_verified     boolean not null default false,
  skill_tier         public.skill_tier,
  verified_tier      public.skill_tier,
  women_courts_only  boolean not null default false,
  no_strong_courts   boolean not null default false,
  saved_partner_id   uuid references public.profiles(id) on delete set null,
  avatar_url         text,
  push_enabled       boolean not null default true,
  email_enabled      boolean not null default true,
  next_ping_enabled  boolean not null default true,
  push_subscription  jsonb,
  is_walk_in         boolean not null default false,
  banned             boolean not null default false,
  banned_at          timestamptz,
  banned_reason      text,
  deleted_at         timestamptz,
  pdpa_consent_at    timestamptz,
  created_at         timestamptz not null default now()
);

-- Auto-create profile on new auth user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: return masked name (first name + last initial) for anon
create or replace function public.mask_name(full_name text)
returns text
language sql
immutable
as $$
  select
    case
      when position(' ' in trim(full_name)) > 0
        then split_part(trim(full_name), ' ', 1) || ' ' ||
             left(split_part(trim(full_name), ' ', 2), 1) || '.'
      else trim(full_name)
    end;
$$;
