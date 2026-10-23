export const instant = false

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { StatusPill } from '@/components/ui/StatusPill'
import Link from 'next/link'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('id, name, date, start_time, end_time, status, max_players, description')
    .eq('id', id)
    .single()

  if (!session) notFound()

  const { data: courts } = await supabase
    .from('courts')
    .select('id, name, type, status')
    .eq('session_id', id)
    .order('name')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/events" className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center bg-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase leading-tight flex-1">{session.name}</h1>
        <StatusPill variant={session.status === 'live' ? 'live' : session.status === 'upcoming' ? 'muted' : 'outline'}>
          {session.status.toUpperCase()}
        </StatusPill>
      </div>

      <div className="bg-white border-2 border-black rounded-[18px] divide-y-2 divide-black overflow-hidden">
        <Row label="Date" value={formatDate(session.date)} />
        <Row label="Time" value={`${formatTime(session.start_time)} – ${formatTime(session.end_time)}`} />
        <Row label="Max players" value={String(session.max_players)} />
      </div>

      {courts && courts.length > 0 && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-body mb-2">Courts</p>
          <div className="flex flex-col gap-2">
            {courts.map(c => (
              <div key={c.id} className="bg-white border-2 border-black rounded-[14px] px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-sm">{c.name}</span>
                <span className="text-xs text-body capitalize">{c.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-body">{label}</span>
      <span className="text-sm font-semibold text-black">{value}</span>
    </div>
  )
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(time: string | null) {
  if (!time) return '—'
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  return `${hour % 12 || 12}:${m}${ampm}`
}
