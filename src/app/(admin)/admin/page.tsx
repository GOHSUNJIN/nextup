export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AdminCourtsTab } from './components/AdminCourtsTab'
import { AdminQueueTab } from './components/AdminQueueTab'
import { AdminCheckinTab } from './components/AdminCheckinTab'
import { EndSessionButton, HandleNoShowsButton } from './components/EndSessionButton'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'courts' } = await searchParams
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('id, name, start_time, end_time, max_players')
    .eq('status', 'live')
    .maybeSingle()

  const { data: upcomingSessions } = await supabase
    .from('sessions')
    .select('id, name, date, start_time')
    .eq('status', 'upcoming')
    .order('start_time')
    .limit(5)

  const tabs = [
    { id: 'courts', label: 'Courts' },
    { id: 'queue', label: 'Queue' },
    { id: 'checkin', label: 'Check-in' },
  ]

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">ADMIN</h1>
        <Link
          href="/admin/events/new"
          className="h-9 px-3 border-2 border-black rounded-full flex items-center text-xs font-bold gap-1"
        >
          + New event
        </Link>
      </div>

      {/* Segmented tabs */}
      <div className="flex bg-muted rounded-[14px] p-1 gap-1">
        {tabs.map(t => (
          <Link
            key={t.id}
            href={`/admin?tab=${t.id}`}
            className={`flex-1 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold transition-colors ${
              tab === t.id
                ? 'bg-white border-2 border-black shadow-[2px_2px_0_#111]'
                : 'text-body'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Session info + end session */}
      {session && (
        <div className="bg-black text-white rounded-[18px] px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">{session.name}</p>
            <p className="text-xs text-[#BDB9AF]">Live session</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <HandleNoShowsButton sessionId={session.id} />
            <EndSessionButton sessionId={session.id} />
          </div>
        </div>
      )}

      {/* Tab content */}
      {tab === 'courts' && (
        <AdminCourtsTab
          session={session}
          upcomingSessions={upcomingSessions}
        />
      )}
      {tab === 'queue' && <AdminQueueTab session={session} />}
      {tab === 'checkin' && <AdminCheckinTab session={session} />}
    </div>
  )
}
