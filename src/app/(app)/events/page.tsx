export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { StatusPill } from '@/components/ui/StatusPill'
import Link from 'next/link'
import { RemindMeButton } from './RemindMeButton'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { role: string } | null = null
  let reminders: string[] = []

  if (user) {
    const admin = createAdminClient()
    const { data: p } = await admin.from('profiles').select('role').eq('id', user.id).single()
    profile = p

    const { data: r } = await supabase
      .from('session_reminders')
      .select('session_id')
      .eq('player_id', user.id)
    reminders = r?.map(x => x.session_id) ?? []
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, name, date, start_time, end_time, status, max_players')
    .order('start_time', { ascending: false })
    .limit(50)

  const live = sessions?.filter(s => s.status === 'live') ?? []
  const upcoming = sessions?.filter(s => s.status === 'upcoming') ?? []
  const past = sessions?.filter(s => s.status === 'ended' || s.status === 'closed') ?? []

  const isAdmin = profile?.role === 'admin' || profile?.role === 'co_admin'

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">EVENTS</h1>
        {isAdmin && (
          <Link href="/admin/events/new" className="h-9 px-3 border-2 border-black rounded-full flex items-center text-xs font-bold gap-1.5">
            <span>+</span> New event
          </Link>
        )}
      </div>

      {!sessions?.length && (
        <div className="flex flex-col gap-3">
          {/* Hero */}
          <div className="relative bg-black rounded-[18px] overflow-hidden px-5 pt-5 pb-8">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow rounded-full opacity-20" />
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow rounded-full opacity-40" />
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">Events</p>
              <h1 className="font-heading font-extrabold italic text-5xl uppercase leading-none text-white">
                Nothing<br />scheduled
              </h1>
              <p className="text-[#BDB9AF] text-sm mt-3">Check back soon. Sessions are added regularly.</p>
            </div>
          </div>

          {isAdmin && (
            <Link href="/admin/events/new">
              <div className="w-full h-[52px] border-2 border-black bg-brand text-white rounded-[14px] font-heading font-extrabold italic text-xl uppercase flex items-center justify-center shadow-[4px_4px_0_#111]">
                + CREATE EVENT
              </div>
            </Link>
          )}

          {/* Sign-in nudge for guests */}
          {!user && (
            <div className="bg-white border-2 border-black rounded-[18px] p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand border-2 border-black flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.916V4a1 1 0 1 0-2 0v1.084A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">Get notified first</p>
                  <p className="text-xs text-body mt-0.5">Sign in to set reminders when new sessions drop.</p>
                </div>
              </div>
              <Link href="/login">
                <div className="w-full h-[48px] border-2 border-black bg-black text-white rounded-[12px] font-heading font-extrabold italic text-lg uppercase flex items-center justify-center shadow-[3px_3px_0_#D2281F]">
                  SIGN IN
                </div>
              </Link>
            </div>
          )}

          {/* What to expect */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-extrabold uppercase tracking-widest text-body px-1">What to expect</p>
            {([
              {
                color: 'bg-yellow', textColor: 'text-black',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>,
                title: 'Open play format',
                body: 'Sessions run as open play. Anyone can join regardless of level.',
              },
              {
                color: 'bg-brand', textColor: 'text-white',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
                title: 'Court rotation queue',
                body: "Join the queue in-app and get assigned to a court when it's your turn.",
              },
              {
                color: 'bg-black', textColor: 'text-white',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: 'Mixed matchups',
                body: "You'll be matched with 3 others to form balanced doubles games.",
              },
            ] as const).map(item => (
              <div key={item.title} className="bg-white border-2 border-black rounded-[16px] p-4 flex gap-3 items-start">
                <div className={`w-8 h-8 rounded-full ${item.color} border-2 border-black flex items-center justify-center shrink-0 ${item.textColor}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs text-body mt-0.5">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {live.length > 0 && (
        <Section title="LIVE NOW">
          {live.map(s => <EventRow key={s.id} session={s} hasReminder={false} showRemind={false} />)}
        </Section>
      )}

      {upcoming.length > 0 && (
        <Section title="UPCOMING">
          {upcoming.map(s => (
            <EventRow key={s.id} session={s} hasReminder={reminders.includes(s.id)} showRemind={!!user} />
          ))}
        </Section>
      )}

      {past.length > 0 && (
        <Section title="PAST">
          {past.map(s => <EventRow key={s.id} session={s} hasReminder={false} showRemind={false} />)}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-extrabold uppercase tracking-widest text-body">{title}</p>
      {children}
    </div>
  )
}

function EventRow({ session, hasReminder, showRemind }: {
  session: { id: string; name: string; date: string | null; start_time: string; end_time: string; status: string }
  hasReminder: boolean
  showRemind: boolean
}) {
  return (
    <div className="bg-white border-2 border-black rounded-[18px] p-4 flex items-center gap-3">
      <Link href={`/events/${session.id}`} className="flex-1 flex flex-col gap-0.5 min-w-0">
        <span className="font-bold text-sm">{session.name}</span>
        <span className="text-xs text-body">{formatDate(session.date)} · {formatTime(session.start_time)}–{formatTime(session.end_time)}</span>
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        {showRemind && <RemindMeButton sessionId={session.id} initialState={hasReminder} />}
        <StatusPill variant={session.status === 'live' ? 'live' : session.status === 'upcoming' ? 'muted' : 'outline'}>
          {session.status === 'live' ? 'Live' : session.status === 'upcoming' ? 'Upcoming' : 'Past'}
        </StatusPill>
      </div>
    </div>
  )
}

function formatDate(date: string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
}

function formatTime(time: string | null) {
  if (!time) return ''
  const d = new Date(time)
  return d.toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '').toLowerCase()
}
