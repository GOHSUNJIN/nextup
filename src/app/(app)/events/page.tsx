export const instant = false

import { createClient } from '@/lib/supabase/server'
import { StatusPill } from '@/components/ui/StatusPill'
import Link from 'next/link'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, name, date, start_time, end_time, status, max_players')
    .in('status', ['upcoming', 'live', 'closed'])
    .order('start_time', { ascending: false })
    .limit(20)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading font-extrabold italic text-3xl uppercase">EVENTS</h1>

      {!sessions?.length ? (
        <p className="text-body text-sm text-center py-8">No upcoming events.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map(s => (
            <Link
              key={s.id}
              href={`/events/${s.id}`}
              className="bg-white border-2 border-black rounded-[18px] p-4 flex items-center justify-between"
            >
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm">{s.name}</span>
                <span className="text-xs text-body">{formatDate(s.date)} · {formatTime(s.start_time)}–{formatTime(s.end_time)}</span>
              </div>
              <StatusPill variant={s.status === 'live' ? 'live' : s.status === 'upcoming' ? 'muted' : 'outline'}>
                {s.status === 'live' ? 'LIVE' : s.status === 'upcoming' ? 'UPCOMING' : 'CLOSED'}
              </StatusPill>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(date: string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(time: string | null) {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  return `${hour % 12 || 12}:${m}${ampm}`
}
