export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { StatusPill } from '@/components/ui/StatusPill'
import Link from 'next/link'
import { RemindMeButton } from './RemindMeButton'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { role: string } | null = null
  let reminders: string[] = []

  if (user) {
    const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
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
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow border-2 border-black flex items-center justify-center shadow-[4px_4px_0_#111]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div>
            <p className="font-heading font-extrabold italic text-2xl uppercase">No events yet</p>
            <p className="text-body text-sm mt-1 max-w-[220px] mx-auto">
              {isAdmin ? 'Create your first event to get started.' : 'Events will appear here once scheduled.'}
            </p>
          </div>
          {isAdmin && (
            <Link href="/admin/events/new" className="h-11 px-5 border-2 border-black rounded-[14px] bg-black text-white text-sm font-bold flex items-center gap-1.5 shadow-[3px_3px_0_#444]">
              + Create first event
            </Link>
          )}
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
