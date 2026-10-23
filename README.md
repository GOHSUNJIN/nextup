# NextUp by Picklepedia

A mobile-first pickleball queue management PWA. Players check in at the venue, join a live queue, and get auto-assigned to courts. Built for Picklepedia (Singapore).

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 with custom design tokens |
| Backend | Supabase (Postgres + Auth + Realtime + RLS) |
| Deployment | Vercel (auto-deploys from `main`) |
| Notifications | Web Push (`web-push` library) |
| Testing | Vitest |

## What's built

- Phone + password auth (no email required; synthetic email used internally)
- Live courts view with active match display
- Events list with upcoming/live/past grouping and remind-me toggle
- Venue check-in via 4-digit rotating code
- Queue: join, leave, view position, requeue after a match
- Break and away states with timers
- Waitlist when a session is full
- Match history with win/loss stats
- Profile: edit name, phone, gender, avatar upload
- Settings: push notification preferences, court preferences
- Admin dashboard: start/end sessions, end matches, create events, add walk-ins
- Realtime queue and court updates via Supabase Realtime
- Push notifications for court assignment
- PWA: installable, service worker registered on load
- Privacy policy page at `/privacy` (public, no auth required)
- Consistent empty states across all tabs (courts, queue, events, history)
- Guest header: Sign In button instead of avatar
- Desktop: narrow 430px column centred on `bg-zinc-800` background

## What's left to build

- QR code venue check-in (currently code-only)
- Pair requests and partner queuing
- Standby system (ping next player before swapping a no-show)
- Strike system for repeated no-shows
- No-show handling
- "You're next" push notification (2nd in queue ping)
- Fairness dashboard for admins
- Audit logs
- Event summary screen after session ends
- Player detail admin page (verify tier, clear strikes, ban)
- Session feedback after a match

## Project structure

```
src/
  app/
    (app)/          # Player-facing pages
      courts/       # Live courts display
      queue/        # Queue page + state components
        states/     # One file per queue state
      events/       # Events list + remind-me
      history/      # Match history
      profile/      # Profile, edit, settings, FAQ
    (admin)/        # Admin-only pages
    (auth)/         # Login, signup
    privacy/        # Privacy policy (public)
    actions/        # Server actions (all mutations)
  components/
    layout/         # Header, BottomNav
    ui/             # Reusable UI components
  lib/
    supabase/       # Server, client, admin Supabase clients
    push.ts         # Web push sender
    format.ts       # Date/time utilities
  types/
    queue.ts        # QueueStateType, MatchData
  __tests__/        # Vitest unit tests
```

## Queue states

```
not_checked_in -> join -> waiting -----> standby
                           ^                |
                      on_break <- finished <- playing <- assigned
                           |
                          away
                                        waitlist (session full)
```

| State | Description |
|---|---|
| `not_checked_in` | Player has not entered the check-in code yet |
| `join` | Checked in; has not joined the queue |
| `waiting` | In queue, awaiting court assignment |
| `standby` | Pinged as next up; court opening soon |
| `waitlist` | Session full; waiting for a slot |
| `assigned` | Assigned to a court; 3 min to check in |
| `playing` | Match in progress |
| `finished` | Match ended; choose requeue or break |
| `on_break` | Taking a break; 30-minute timer |
| `away` | Break expired; can still rejoin |

## Database

Schema is managed directly in the Supabase dashboard (no CLI migrations). Core tables:

`profiles`, `sessions`, `courts`, `queue_entries`, `matches`, `match_players`, `pair_requests`, `session_reminders`, `session_checkins`, `checkin_tokens`, `push_subscriptions`, `public_log`, `admin_log`

Key RPCs: `fill_courts`, `promote_waitlist`, `venue_checkin`, `join_queue`, `end_session`, `handle_no_shows`, `start_session`

### Required RLS setup

After creating the database, run this in the Supabase SQL editor:

```sql
-- Table-level grants (required before RLS policies take effect)
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- RLS policies for profiles
CREATE POLICY "profiles_auth_select"
  ON public.profiles FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "profiles_auth_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
```

Without these, the profile page will show blank data even if the database has rows.

## Setup

1. Create a Supabase project
2. Clone this repo and install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key |
| `VAPID_SUBJECT` | Web Push VAPID subject (`mailto:you@example.com`) |

Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

4. Apply the RLS setup SQL above in the Supabase dashboard
5. Run the dev server: `npm run dev`

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Run tests
```

## Auth

Users sign up with a phone number and password. Internally, a synthetic email (`<digits>@nextup.app`) is used with Supabase Auth since Supabase does not support phone+password without an SMS provider. Users only ever see and enter their phone number.

## Design

Neobrutalist style: 2px black borders, hard drop shadows (`4px 4px 0 #111`), yellow accents (`#FFC72C`), brand red (`#D2281F`), Barlow Condensed for headings. Design tokens are in `src/app/globals.css`.

Empty states across all tabs follow a consistent pattern: dark hero card, red CTA button, then individual feature cards with coloured icon circles (yellow/red/black).

## Roles

| Role | Capabilities |
|---|---|
| `player` | Check in, join queue, manage own entry |
| `co_admin` | End matches, change court types, add walk-ins |
| `admin` | Start/end sessions, create events, full access |

Roles are set directly in the database (`profiles.role`), never from the client.

## Deployment

Connected to Vercel. Push to `main` triggers a production deploy automatically.

Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables — the app layout and admin actions depend on it.
