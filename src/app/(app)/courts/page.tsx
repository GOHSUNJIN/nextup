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
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-muted border-2 border-black flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4A4740" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </div>
        <div>
          <h1 className="font-heading font-extrabold italic text-3xl uppercase">No play today</h1>
          {next && (
            <p className="text-body text-sm mt-1">
              Next up: <span className="font-bold text-black">{next.name}</span>
            </p>
          )}
        </div>
        <Link href="/events" className="text-sm font-bold underline underline-offset-2">
          View all events
        </Link>
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
