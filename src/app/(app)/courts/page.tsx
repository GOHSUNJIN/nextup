export const dynamic = 'force-dynamic'


import { createClient } from '@/lib/supabase/server'
import { CourtCard } from '@/components/ui/CourtCard'
import { StatCard } from '@/components/ui/StatCard'
import Link from 'next/link'

export default async function CourtsPage() {
  const supabase = await createClient()

  // Get live session
  const { data: session } = await supabase
    .from('sessions')
    .select('id, name, start_time, end_time, max_players')
    .eq('status', 'live')
    .maybeSingle()

  if (!session) {
    // No live session — show next upcoming
    const { data: next } = await supabase
      .from('sessions')
      .select('name, date, start_time')
      .eq('status', 'upcoming')
      .order('start_time', { ascending: true })
      .limit(1)
      .maybeSingle()

    return (
      <div className="flex flex-col gap-4 py-2">
        {/* Dark hero */}
        <div className="relative bg-black rounded-[18px] border-2 border-black overflow-hidden px-5 pt-5 pb-6">
          {/* Yellow burst accent */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow rounded-full opacity-90" />
          <div className="absolute -top-3 -right-3 w-14 h-14 bg-yellow rounded-full" />

          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">Courts</p>
            <h1 className="font-heading font-extrabold italic text-5xl uppercase leading-none text-white">
              No play<br />today
            </h1>
            <p className="text-[#BDB9AF] text-sm mt-3">No live session right now.</p>
          </div>
        </div>

        {/* Next event card */}
        {next ? (
          <div className="bg-white border-2 border-black rounded-[18px] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow border-2 border-black flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-widest text-body mb-0.5">Next up</p>
              <p className="font-bold text-sm truncate">{next.name}</p>
              <p className="text-xs text-body">{formatDate(next.date)} · {formatTime(next.start_time)}</p>
            </div>
            <Link href="/events" className="text-xs font-bold underline shrink-0">See all</Link>
          </div>
        ) : (
          <div className="bg-white border-2 border-black rounded-[18px] p-4 text-center">
            <p className="text-body text-sm">No upcoming events scheduled.</p>
            <Link href="/events" className="text-sm font-bold underline mt-1 inline-block">View events</Link>
          </div>
        )}
      </div>
    )
  }

  // Get courts for this session
  const { data: courts } = await supabase
    .from('courts')
    .select('id, name, type, status')
    .eq('session_id', session.id)
    .order('name')

  const courtIds = courts?.map(c => c.id) ?? []
  let matchMap: Record<string, { teamA: string; teamB: string; minsPlaying?: number }> = {}

  if (courtIds.length > 0) {
    const { data: activeMatches } = await supabase
      .from('matches')
      .select('id, court_id, started_at, team_a, team_b')
      .in('court_id', courtIds)
      .is('ended_at', null)

    if (activeMatches?.length) {
      const allPlayerIds = [...new Set(activeMatches.flatMap(m => [...(m.team_a ?? []), ...(m.team_b ?? [])]))]
      const { data: players } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', allPlayerIds)

      const playerName = (id: string) => {
        const p = players?.find(p => p.id === id)
        if (!p?.name) return '?'
        const parts = p.name.trim().split(' ')
        return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
      }

      for (const m of activeMatches) {
        const teamA = (m.team_a ?? []).map(playerName).join(' & ')
        const teamB = (m.team_b ?? []).map(playerName).join(' & ')
        const minsPlaying = m.started_at
          ? Math.floor((Date.now() - new Date(m.started_at).getTime()) / 60000)
          : undefined
        matchMap[m.court_id] = { teamA, teamB, minsPlaying }
      }
    }
  }

  // Get playing count and queue count
  const { count: playingCount } = await supabase
    .from('queue_entries')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session.id)
    .eq('status', 'playing')

  const { count: queueCount } = await supabase
    .from('queue_entries')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session.id)
    .eq('status', 'waiting')

  const { count: courtCount } = await supabase
    .from('courts')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session.id)
    .eq('status', 'playing')

  return (
    <>
      {/* Session header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-extrabold italic text-3xl uppercase leading-tight">
          COURTS
        </h1>
        <Link
          href="/events"
          className="text-xs font-bold border-2 border-black rounded-full px-3 h-9 flex items-center"
        >
          All events
        </Link>
      </div>

      {/* Stats */}
      <StatCard
        cells={[
          { value: courtCount ?? 0, label: 'Courts active' },
          { value: playingCount ?? 0, label: 'Playing' },
          { value: queueCount ?? 0, label: 'In queue' },
        ]}
      />

      {/* Court cards */}
      <div className="flex flex-col gap-2">
        {courts?.map((court, i) => (
          <CourtCard
            key={court.id}
            num={i + 1}
            name={court.name}
            type={court.type as 'open' | 'strong' | 'casual' | 'women' | 'mixed'}
            status={court.status as 'empty' | 'assigned' | 'playing' | 'paused'}
            teamA={matchMap[court.id]?.teamA}
            teamB={matchMap[court.id]?.teamB}
            minsPlaying={matchMap[court.id]?.minsPlaying}
          />
        ))}
      </div>
    </>
  )
}

function formatDate(date: string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(time: string | null) {
  if (!time) return ''
  return new Date(time).toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
}
