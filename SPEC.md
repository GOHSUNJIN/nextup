# NextUp by Picklepedia: Build Spec

Build "NextUp by Picklepedia" (short name: NextUp), a mobile-first web app that auto-assigns pickleball players to courts from a single queue. Players use it on their phones at the venue, often outdoors.

## Tech stack
- Next.js (App Router) + TypeScript, deployed on Vercel
- Supabase: Auth, Postgres with Row Level Security, Realtime, Edge Functions, pg_cron
- GitHub: single `main` branch, auto-deployed to Vercel production. One Supabase project. Test locally with the Supabase CLI (`supabase start`) and a local seed so testing never touches real queues
- Repo and Vercel project name: `nextup`
- PWA: installable, with web push support
- No SMS anywhere in the app
- All pg_cron schedules and displayed times use Asia/Singapore time

## Design integration
- The UI is exported from Claude Design as one HTML file: `design/nextup-design.html`. Each screen is an artboard named as in the screen map below. Treat it as the visual source of truth
- Before building any screen, find the matching artboard (see the screen map below) and match it closely
- Extract colors, fonts, spacing and radii into design tokens (Tailwind config + CSS variables). Never hardcode values in components
- Convert the HTML into reusable React components. Do not paste static HTML into pages
- Keep all logic and data in components, wired to Supabase. The design files are layout only
- If a screen in this spec has no design file, build it from the same tokens and components
- If design and spec conflict on behaviour, follow the spec. If they conflict on looks, follow the design
- Never edit files in `/design`
- The `App` artboard is an interactive prototype. Use it to understand flows and state changes, not as code to copy

### Design tokens
- Colors: red `#D2281F` (primary actions, alerts), logo red `#E3342F`, yellow `#FFC72C` (highlights, badges, active nav), black `#111111` (outlines, headings, nav bar), white `#FFFFFF`, page background `#F4F2EC`, muted grey `#ECEAE4`, body grey text `#4A4740`, success bg `#DDF3E4` / text `#17603A`, danger bg `#FDE7E5` / text `#B3201A`
- Fonts (Google Fonts): `Barlow Condensed` 800 italic for headings and big numbers, `Inter` 400 to 800 for body, `Luckiest Guy` for the NEXTUP wordmark only
- Radii: cards 18px, buttons 14 to 16px, pills 999px, phone frame 36px
- Borders: 2px solid black on cards and buttons
- Shadow: hard offset `4px 4px 0 #111111` on hero cards and primary buttons. No soft shadows except toasts and notifications
- Dark surfaces: card `#111111`, inner cell `#232323`, divider `#3A3A3A`, muted text on dark `#BDB9AF`, body text on dark `#D6D3CB`
- Yellow is an accent, not a fill for big blocks. Use it for icon tiles, numbers on dark cards, the burst, active states and the current-user row
- Min tap target 44px

### Text casing
- ALL CAPS only for page titles (h1), section headings (h2) and big action buttons, all in Barlow Condensed
- Everything else is sentence case: labels, chips, status pills, stat labels, form labels, roles, tabs, toasts and small buttons (e.g. "Solo", "Pair", "Playing · 12 min", "Your position · Solo", "Email")
- Keep acronyms and codes in caps: DUPR, QR, PM, AM, FAQ, PDPA, DELETE (in the delete account confirm)
- No letter spacing on sentence case text
- The wordmark "NEXTUP" and "BY PICKLEPEDIA" stay in caps
- Store enum values in lowercase in the database (e.g. `open`, `mixed`) and map them to display labels in one place

### Shared components
- Header: app icon + NEXTUP wordmark on the left. On the right, the signed-in user's name, role underneath ("Player" in grey, "Admin" in red) and a 38px round avatar. The avatar shows their uploaded profile photo, falling back to initials on yellow (players) or red (admins). Guests see "Guest", "Not signed in" and a grey avatar with a person icon. Tapping it opens Profile (guests: sign up sheet)
- Pagination (`Pager`): left side shows "1–10 of 42" (or "3 of 12" for one item per page). Right side has back and next arrow buttons plus page numbers, collapsing to "1 2 3 … 14" when there are many pages. Current page is black with a yellow number. Disabled arrows are greyed out. 34px buttons, 44px tap area
- StatCard (dark): black card with 3 cells, yellow Barlow numbers, small grey labels and 1px dividers
- NoticeCard: white card with black border and a 36px yellow icon tile on the left, title and body text
- DarkHero: black card with the yellow logo burst peeking out of the top right corner
- BottomNav (4 tabs, 5 for admin, queue position badge), CourtCard, QueueRow, StatusPill, BigActionButton, CountdownTimer, Toast, UndoToast, ConfirmDialog, BottomSheet, Toggle, SegmentedControl, PlayerAvatar

### Pagination
- Every list that can grow uses the Pager under it, even when there is only one page
- Applies to: the queue (player, guest and admin), waitlist, partner search results, history, audit logs, fairness list, events (upcoming and past), admin player lists
- Page sizes: queue 10, history 10, audit logs 20, events 10, search results 10, fairness 20
- Use keyset pagination in Supabase (order by position or created_at with a cursor) rather than large offsets. Keep the page in the URL (`?page=2`) so refresh keeps it
- The queue list always keeps the user's own row visible. If they are not on the current page, pin "You · #23" above the list with a "Jump to my spot" link
- Realtime updates refresh the current page without jumping back to page 1

### App icon
- Use the files in `/public/icons`: `icon.svg`, `favicon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon-32.png`
- Wire them into `manifest.webmanifest` (name "NextUp", short_name "NextUp", theme_color `#E3342F`, background_color `#F4F2EC`, display `standalone`) and the root layout metadata
- Use `favicon.svg` (simplified holes) for anything under 64px

## Navigation (bottom nav bar)
- Players get 4 tabs. Admins and co-admins get a 5th
  - Courts (grid icon): live courts, court types and who's playing. Default landing tab, where guests land. Has an "All events" button
  - Queue (list icon): venue check-in, join / leave, pair up or split, queue position, wait estimate, check-in, requeue or break
  - History (clock icon): past matches, partners, games played
  - Profile (person icon): settings, preferences, FAQ, delete account, log out
  - Admin (shield icon, admin and co-admin only): live courts, queue, venue check-in QR, events, alerts, audit logs, fairness dashboard
- Queue tab shows a badge with the player's position number
- When "You're up" fires, auto-switch to the Queue tab with the check-in button visible
- Guests see Courts and Queue (view only). Tapping History, Profile or any join action opens sign-up
- Each tab and screen is its own URL route so refresh and back keep the user in place

## User roles
- Guest (not logged in): read-only courts, queue and events. Names shown as first name + last initial. Prompted to sign up on any action
- Player: personal account, join sessions, queue solo or as a pair, pick a partner per session, split anytime, requeue or break, rejoin anytime
- Walk-in: added by admin with name only (no account). Queues under the same rules. Admin checks them in
- Admin: full control. Can also play under the same rules as players. Role set in the database only, never from the client
- Co-admin: promoted by admin, can manage any live session, run courts and end matches

## Events
- Events page reachable from Courts ("All events"), grouped Live now / Upcoming / Past
- Players: "Remind me" on upcoming events (email the day before). Guests: "Sign up to join"
- Admin: "+ New event" with name, date, time, number of courts, max players, match reminder time (default 20 min) and starting court types. Edit settings, view summaries of past events
- Daily auto-session toggle (pg_cron creates one per day from admin defaults)
- "No play today" empty state on Courts when there is no live event, showing the next one
- A player can only be in one active session at a time
- Players on break count toward the max players cap. Players marked away do not
- When max players is reached, new joins go to a waitlist and are promoted when someone leaves or goes away
- When the session end time passes, alert admin with "End event now" or "Extend 30 min". Auto-end 30 minutes after
- Admin "End event" button with confirmation ("All courts stop and everyone is removed from the queue. This can't be undone.")
- After ending: admin summary (matches, total time, players, average wait, walk-ins, no-shows, games per court) and a player wrap-up (games, wins, average wait, "How was tonight?" feedback)

## Venue check-in (anti remote queueing)
- Players must check in at the venue before they can join the queue. Browsing is allowed from anywhere
- Admin Check-in tab shows a rotating QR code that refreshes every 60 seconds, plus a 4-digit code that rotates with it, and a count of players checked in
- Players scan the QR (or type the code) to mark themselves "at venue" for that session
- QR and code are signed tokens (session_id + expiry) validated by a Postgres function. Expired tokens are rejected
- "At venue" lasts the whole session. Requeue, break and rejoin need no rescan
- Pair joins require both partners to be checked in. Partner search shows "Not here" for players who aren't
- Walk-ins added by admin are automatically at venue
- Optional: GPS within 150 m as a soft warning only, never the sole check

## Court types
- Admin sets each court's type and name any time (applies from the next match): Open, Strong, Casual, Women, Mixed
- Open: anyone. Strong: verified strong tier only, excluding players who opted out. Casual: casual tier only. Women: female only. Mixed: each team is 1 male + 1 female
- Mixed courts: take the first 2 eligible males and first 2 eligible females from the top of the queue. A mixed pair counts as 1 of each and stays on the same team. Same-gender pairs are not eligible
- On Open courts, tier only balances teams. It never changes who plays
- If a court cannot fill within 3 minutes, alert admin: "Not enough eligible players for Court X. Switch to Open?"
- Show skipped players the reason ("Court 2 is Women only, you keep your spot")
- If a player has "Women courts only" and no Women court is active, show "No Women courts right now" and let them play any court for this session only

## Pairs
- Partner choice is per session. On join, choose solo or pick a partner for that session. The saved partner in settings is only a pre-filled suggestion
- Partner search by name or player ID, then send a request they accept. Accept dialog shows both positions and the combined position
- Requests only go to players in the same session who are checked in and not on a court. Max 3 pending requests per player
- Players can pair up mid-session. The pair's position is the later of the two partners' positions
- Either partner can split anytime. While waiting: both become solos and keep the pair's position, next to each other. While assigned or playing: the split applies after the match
- "Women courts only" players cannot pair with a male partner
- If a pair splits after a match (one requeues, one breaks), the requeuer goes back as a solo

## Queue logic (most important part)
- ONE queue per session, ordered by join time
- Admin or co-admin ends a match (optional score entry). "End match" has a 10-second undo before rotation commits and notifications send
- Lock the court row during end match and undo. If two admins act at once, the second gets "Already ended"
- Any empty court refills automatically whenever the queue changes (match end, requeue, rejoin, new join, pair split or court added)
- Remind admin to end a match once it passes the match reminder time (end match or snooze 5 min)
- On refill: scan from the top and assign the first 4 eligible players for that court type. A pair takes 2 slots. If only 1 slot is left, the next eligible solo fills it and the pair keeps its position
- Skipped players keep their position
- skip_count only increases when skipped because of court type, never because of the player's own preference
- skip_count only breaks ties among the first 8 eligible players. It never lets anyone jump further
- skip_count resets to 0 when assigned and at the start of each session
- Team building priority: eligibility > tier balance > partner rotation > new opponents
  - Tier balance: one strong + one casual per side for solos on Open courts, using verified tier
  - Partner rotation: solos avoid the same partner twice in a row
  - New opponents: prefer players not yet faced this session

## Check-in
- When assigned, the player taps "I'm here" within 3 minutes
- At the same time, ping the next eligible player as standby so a no-show swap is instant. Standby screen shows the assigned player's remaining time
- Standby players stay assignable to other courts. If a standby is assigned elsewhere, the next eligible player becomes standby
- No-show: standby takes the slot. The no-show goes to the back with 1 strike and sees a "Missed check-in" screen
- Players with push off and the app closed still go to the back on a no-show, but get no strike
- Pair partner no-show: present partner stays, standby fills the missing slot, the pair splits
- Unneeded standby players keep their position and get first pick next rotation
- 2 strikes in a session = auto break. Strikes reset each session. Admin can clear strikes
- Rebalance teams once all 4 check in. The match auto-starts when all 4 check in. Admin can force start
- Admin checks in walk-ins

## After a match
- Finished players see "Good game!" with the score and choose "Requeue" (back of queue) or "Take a break"
- The 60-second choice timer only starts when the prompt is actually on screen. Record prompt_seen_at when it first renders
- If they don't open the app within 10 minutes of finishing, they go on break
- No choice within 60 seconds of seeing the prompt = break
- Break screen shows a timer out of 30 minutes, "Rejoin queue" and "I'm done for tonight"
- After 30 minutes on break, players become "away" (warning at 25 minutes). Away players don't count toward the cap but can rejoin anytime (to the waitlist if full)

## Fairness rules
- All timestamps from database now(), never client time. Ties broken by entry ID
- Skip a turn: 1 skip per hold, then the player drops 4 places
- Admins cannot override their own position. Admin can end their own match (logged). Co-admins can also end it
- Every manual override requires a reason
- Strong tier comes from a verified DUPR rating or admin verification, never self-declared
- Gender changes require admin re-verification before Women or Mixed eligibility
- Fairness dashboard: average wait, games per player, players flagged for long waits or too many games, average wait per player chart

## Admin features
- Admin tab with a segmented control: Live courts / Queue / Check-in
- Live courts: end match (with score sheet and undo), force start, check in players, court type and name picker, alerts banner
- Queue: add walk-ins by name, move players (reason required), view strikes
- Player detail: verify gender, DUPR and tier, clear strikes, move in queue, make co-admin, merge account, ban (banned players are removed from queue and courts immediately)
- Alerts screen: match over time, court can't fill, session end time passed
- Events, create event, audit logs, fairness dashboard, end event, event summary

## Audit logs
- Public log (visible to players): manual moves, court type changes, admin ending their own match, undo, walk-ins
- Admin-only log: gender, profile and tier changes, strike clears, account merges, bans and deletions

## Notifications
- "You're next" when 2nd in line for an eligible court
- "You're up on Court X" when assigned
- Standby ping, pair request received / accepted / partner split, break warning at 25 minutes
- Admin: match past reminder time, court can't fill, session end time passed
- Web push first. Prompt iPhone users to add to home screen (required for push) with a 3-step sheet
- Warn players with notifications off before they join ("Join anyway, I'll keep the app open")
- Sound and vibration when the app is open
- Email via Resend for event reminders. Structure notifications so WhatsApp can be added later. No SMS

## Sign up and login
- Email + password with email verification through Supabase Auth, plus magic link login
- New players can join immediately. Verification required within 24 hours (banner with "Resend email") or the account is locked until verified
- Welcome screen after sign up explaining: scan venue QR, join solo or with a partner, get pinged
- Phone collected but not SMS verified. Unique phone and email
- Gender required at sign-up (Male / Female), used only for Women and Mixed courts
- PDPA consent checkbox and short privacy note (Singapore) explaining why email, phone and gender are collected

## Settings (inside Profile)
- Profile photo (upload to Supabase Storage, cropped square, max 2MB, initials fallback), name, gender, DUPR username (optional, shows verified rating), phone, email, change password
- Play preferences: default mode (solo / pair), saved partner (suggestion only), "Don't put me on Strong courts", "Women courts only" (female players)
- Notifications: push, "You're next" ping, email reminders
- Preference changes apply on the next join or requeue
- FAQ accordion
- Delete account: type DELETE to confirm. Removes personal data, past matches show "Former player"

## Reliability
- Supabase Realtime for courts and queue. Refetch on reconnect and when the app returns to foreground
- Refresh never loses the user's place. Screen is derived from status in the database
- Timers (check-in, requeue/break, break limit, end match undo, QR expiry): store deadlines in the database and evaluate expiry on every read or write. pg_cron sweep every minute as backup. Never rely on cron for second-level precision
- Offline banner ("You're offline. Reconnecting...") with last-known position dimmed and skeleton placeholders

## Data model (suggested, refine as needed)
- profiles: id, name, gender, gender_verified, role (player / co_admin / admin), dupr_username, dupr_rating, dupr_verified, phone (unique, nullable for walk-ins), email (unique, nullable for walk-ins), email_verified, skill_tier, verified_tier, women_courts_only, no_strong_courts, saved_partner_id, avatar_url, push_enabled, email_enabled, next_ping_enabled, is_walk_in, banned, deleted_at
- sessions: id, name, date, start_time, end_time, max_players, match_reminder_minutes, status (upcoming / live / ended), is_daily_auto
- session_reminders: session_id, player_id
- session_checkins: session_id, player_id, checked_in_at, method (qr / code / admin)
- checkin_tokens: id, session_id, code, expires_at
- courts: id, session_id, name, type (open / strong / casual / women / mixed), status (empty / assigned / playing / paused)
- queue_entries: id, session_id, player_id, partner_id, mode (solo / pair), status (waiting / assigned / standby / playing / finished / on_break / away / waitlist / left), joined_at, queue_position_at, skip_count, strike_count, standby_priority, split_pending, finished_at, prompt_seen_at, checkin_deadline, break_started_at
- matches: id, court_id, team_a, team_b, assigned_at, started_at, ended_at, end_committed_at, score_a, score_b
- match_players: match_id, player_id, team, checked_in_at
- pair_requests: id, session_id, from_player, to_player, status (pending / accepted / declined / cancelled)
- session_feedback: session_id, player_id, rating (great / okay / not_great)
- public_log, admin_log: id, actor_id, action, target, reason, created_at

## RLS
- Anon: select courts, live matches, queue and sessions. Names returned as first name + last initial only
- Player: insert/update only their own queue entry, pair requests, reminders and feedback through RPCs. Read own profile and public_log. Delete own account
- Co-admin: end matches, manage courts, add walk-ins and show check-in codes in any live session
- Admin: full access including admin_log, checked via profiles.role
- Nobody can update queue order directly. Banned users cannot join sessions

## Testing
- Seed: 30 fake players with mixed genders, tiers, solos, pairs and 3 walk-ins, one live event, two upcoming, one past
- Concurrency: end 2 matches at the same moment, two admins ending or undoing the same court
- Queue: pair position, splitting while waiting and while playing, mid-session pairing, Mixed filling, court type skipping, skip_count tie-break limit
- Check-in: no-show with standby swap, standby assigned elsewhere, pair partner no-show, team rebalance
- Cap: break players counted, break to away, waitlist promotion
- Undo: within 10 seconds cancels rotation and notifications
- Venue: expired QR rejected, code rotates, pair needs both checked in
- Refresh during every status shows the same screen and correct timer

## Screen map (design artboard → route)
| Artboard | Route / state |
|---|---|
| GuestCourts, Main | `/courts` (guest / player) |
| NoSession | `/courts` with no live event |
| EventsPlayer, EventsGuest, AdminEvents | `/events` |
| CreateEvent | `/admin/events/new` |
| SignUp, LogIn, VerifyEmail | `/signup`, `/login`, welcome after sign up |
| AddToHome, NotifOff | sheets / dialogs |
| VenueCheckin | `/queue` before check-in |
| JoinSolo, PairSearch, Paired, PairRequest | `/queue` join states |
| Queue, WaitingPair, YoureNext, Waitlist, Skipped, WomenNoCourt | `/queue` waiting states |
| YoureUp, Standby, MissedCheckin, Playing | `/queue` assignment states |
| Finished, OnBreak, Away, EventEndedPlayer | `/queue` after-match states |
| History | `/history` |
| Profile, Settings, FAQ, DeleteAccount | `/profile`, `/profile/settings`, `/profile/faq` |
| Offline | global banner |
| Admin, ScoreEntry, CourtType, AlertOverdue | `/admin` live courts |
| AdminQueue | `/admin/queue` |
| AdminCheckin | `/admin/checkin` |
| PlayerDetail | `/admin/players/[id]` |
| AuditLog, Fairness | `/admin/logs`, `/admin/fairness` |
| EndEvent, Summary | end event dialog, `/admin/events/[id]/summary` |
| Header, Nav, Pager | shared components |
| App | interactive prototype (reference only) |

## How to build
Work in phases and stop for my review after each:
1. Project setup, local Supabase, schema, migrations, RLS, seed script
2. Design tokens and shared components from the design file, PWA manifest and icons, email auth, roles, gender, PDPA, bottom nav, settings, delete account
3. Events, sessions, courts, court types, walk-ins and admin controls
4. Venue check-in (rotating QR + code) and the queue engine (Postgres functions) + realtime UI
5. Assignment check-in with standby, requeue / break / away, strikes, waitlist, pairs and splitting, team building, fairness rules
6. Notifications (push + email + in-app sound) and admin alerts
7. History, audit logs, fairness dashboard, event summaries, FAQ, offline state, polish, tests
