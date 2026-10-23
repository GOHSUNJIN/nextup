# NextUp

A mobile-first pickleball queue management PWA. Players check in at the venue, join a live queue, and get auto-assigned to courts based on fairness logic. Built for Picklepedia.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 with custom design tokens |
| Backend | Supabase (Postgres + Auth + Realtime + RLS) |
| Deployment | Vercel |
| Notifications | Web Push (`web-push` library) |
| Testing | Vitest |

## Features

- **Live queue** — join, wait, get assigned to a court automatically
- **Venue check-in** — rotating 4-digit code or QR scan confirms you're on-site
- **Court types** — Open, Strong, Casual, Women, Mixed; eligibility filters assignments
- **Pair system** — request a partner; pairs are placed together in the queue
- **Standby** — pings the next eligible player before swapping in a no-show
- **Break / Away** — take a break; auto-marked Away after 30 min
- **Waitlist** — when session is full, players wait with a live position number
- **Admin dashboard** — manage courts, fill courts, handle no-shows, end matches
- **Walk-ins** — admins can add venue walk-ins directly to the queue
- **Realtime** — queue and court state updates instantly via Supabase Realtime
- **Push notifications** — assigned, session-ended, and reminder alerts
- **PWA** — installable, service worker registered on first load

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Player-facing pages
│   │   ├── courts/         # Live courts display
│   │   ├── queue/          # Queue page + state components
│   │   │   └── states/     # One component per queue state
│   │   ├── events/         # Events list + remind-me toggle
│   │   ├── history/        # Match history with pagination
│   │   └── profile/        # Profile view + edit
│   ├── (admin)/            # Admin-only pages
│   │   └── admin/          # Courts / Queue / Check-in tabs
│   ├── (auth)/             # Login, signup, verify-email
│   └── actions/            # Server actions (mutations)
│       ├── auth.ts         # Sign up, sign in, update profile, delete account
│       ├── queue.ts        # Join, leave, requeue, break, rejoin
│       ├── checkin.ts      # Venue check-in, player match check-in
│       ├── admin.ts        # End session, end match, start session, walk-ins, create event
│       └── events.ts       # Toggle session reminder
├── components/
│   ├── layout/             # Header, BottomNav
│   └── ui/                 # Reusable UI primitives
├── lib/
│   ├── supabase/           # Server, client, and admin Supabase clients
│   ├── push.ts             # Web push notification sender
│   └── format.ts           # Date / time formatting utilities
├── types/
│   └── queue.ts            # QueueStateType, MatchData
└── __tests__/              # Vitest unit tests
```

## Queue States

A player moves through these states during a session:

```
not_checked_in → join → waiting ─────────────────────┐
                          ↑         ↓                  |
                     on_break ← finished ← playing ←── standby
                          ↓         ↓                  |
                         away   (leave)         ← assigned ←┘
                                                       |
                                                   waitlist
```

| State | Description |
|---|---|
| `not_checked_in` | Player hasn't scanned in at venue yet |
| `join` | Checked in; hasn't joined queue |
| `waiting` | In queue; awaiting court assignment |
| `standby` | Pinged as next up; court opening soon |
| `waitlist` | Session full; waiting for a spot |
| `assigned` | Assigned to a court; 3 min to check in |
| `playing` | Match in progress |
| `finished` | Match ended; choose requeue or break |
| `on_break` | Taking a break; 30 min timer |
| `away` | Break expired; can still rejoin |

## Database Schema

Core tables: `profiles`, `sessions`, `courts`, `queue_entries`, `matches`, `match_players`, `pair_requests`, `session_reminders`, `session_checkins`, `checkin_tokens`, `push_subscriptions`, `public_log`, `admin_log`

Key Supabase RPCs: `fill_courts`, `promote_waitlist`, `venue_checkin` (validate code), `join_queue`, `end_session`, `handle_no_shows`, `start_session`

Migrations are in `supabase/migrations/` and run in sequence.

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase CLI
- A Supabase project (or run locally with `supabase start`)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

# Reset and seed local database
npm run db:reset

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key |
| `VAPID_SUBJECT` | Web Push VAPID subject (`mailto:...`) |

### Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

## Development Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run db:reset     # Reset and reseed local Supabase
npm run db:types     # Regenerate TypeScript types from schema
```

## Testing

```bash
npm test
```

Tests live in `src/__tests__/`. Covers:
- Queue state resolution logic
- Wait time estimation
- Date/time formatting utilities
- Push notification dispatch

## Design Tokens

Defined in `src/app/globals.css` (`@theme` block):

- **Colors**: `yellow` (brand accent), `black`/`white`, `muted`, `body`, `success-*`, `danger-*`
- **Fonts**: Inter (body), Barlow Condensed (headings), Luckiest Guy (wordmark)
- **Card shadow**: `4px 4px 0 #111111`
- **Radii**: 18px cards, 14–16px buttons, 999px pills

## Deployment

Deployed on Vercel, connected to the `main` branch. Push to `main` triggers a production deploy.

```bash
# Preview deploy
vercel

# Production deploy
vercel --prod
```

## Role System

| Role | Capabilities |
|---|---|
| `player` | Check in, join queue, manage own entry |
| `co_admin` | + End matches, change court types, add walk-ins |
| `admin` | + Start/end sessions, create events, full access |

## Architecture Notes

- **Server Actions** handle all mutations; pages are read-only server components
- **RLS** enforces role permissions at the database level
- **Realtime subscriptions** (in `QueueView.tsx`) refresh the page on any queue/court/session change
- **Fractional `queue_position`** avoids renumbering on insertion; `skip_count` tracks court-type ineligibility only
- All auth-dependent pages use `export const dynamic = 'force-dynamic'` to prevent stale caching
