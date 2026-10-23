-- Switch to phone-based auth
-- 1. Fix handle_new_user trigger: don't store synthetic @nextup.app email in profiles
-- 2. Drop unique constraint on email (phone is now the login identifier)
-- 3. Drop email_verified column (no longer relevant)

-- Updated trigger: only inserts name from metadata, profile upsert in app handles the rest
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Player')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop unique constraint on email so multiple rows can have NULL
alter table public.profiles drop constraint if exists profiles_email_key;

-- Drop email_verified — no emails are collected anymore
alter table public.profiles drop column if exists email_verified;
