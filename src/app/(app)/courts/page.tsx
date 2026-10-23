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
        <div className="relative bg-black rounded-[18px] overflow-hidden px-5 pt-5 pb-8">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow rounded-full opacity-20" />
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow rounded-full opacity-40" />
          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">Courts</p>
            <h1 className="font-heading font-extrabold italic text-5xl uppercase leading-none text-white">
              No play<br />today
            </h1>
            <p className="text-[#BDB9AF] text-sm mt-3">No live session right now.</p>
          </div>
        </div>

        {next ? (
          <div className="bg-white border-2 border-black rounded-[18px] p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow border-2 border-black flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-widest text-body mb-0.5">Next session</p>
                <p className="font-bold text-sm truncate">{next.name}</p>
                <p className="text-xs text-body">{formatDate(next.date)} · {formatTime(next.start_time)}</p>
              </div>
            </div>
            <Link href="/events">
              <div className="w-full h-[52px] border-2 border-black bg-brand text-white rounded-[14px] font-heading font-extrabold italic text-xl uppercase flex items-center justify-center shadow-[4px_4px_0_#111]">
                VIEW ALL EVENTS
              </div>
            </Link>
          </div>
        ) : (
          <Link href="/events">
            <div className="w-full h-[52px] border-2 border-black bg-brand text-white rounded-[14px] font-heading font-extrabold italic text-xl uppercase flex items-center justify-center shadow-[4px_4px_0_#111]">
              VIEW ALL EVENTS
            </div>
          </Link>
        )}

        {/* How it works */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-body px-1">How it works</p>
          {[
            { n: '1', title: 'Check in at the venue', body: 'Enter the 4-digit code from the admin screen when you arrive.', color: 'bg-yellow' },
            { n: '2', title: 'Join the queue', body: 'Head to the Queue tab and tap join. You\'ll get a position number.', color: 'bg-brand' },
            { n: '3', title: 'Get assigned to a court', body: 'When it\'s your turn, you\'ll be matched with 3 others and assigned a court.', color: 'bg-black' },
          ].map(step => (
            <div key={step.n} className="bg-white border-2 border-black rounded-[16px] p-4 flex gap-3 items-start">
              <div className={`w-8 h-8 rounded-full ${step.color} border-2 border-black flex items-center justify-center shrink-0`}>
                <span className={`font-heading font-extrabold text-sm ${step.color === 'bg-yellow' ? 'text-black' : 'text-white'}`}>{step.n}</span>
              </div>
              <div>
                <p className="font-bold text-sm">{step.title}</p>
                <p className="text-xs text-body mt-0.5">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
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
