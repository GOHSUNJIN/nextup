export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QueueView } from './QueueView'

export type QueueStateType =
  | 'no_session'
  | 'not_checked_in'
  | 'join'
  | 'waiting'
  | 'assigned'
  | 'playing'
  | 'finished'
  | 'on_break'
  | 'away'

export type MatchData = {
  matchId: string
  courtName: string
  courtType: string
  teamA: string[]
  teamB: string[]
  startedAt: string | null
  endedAt: string | null
  scoreA: number | null
  scoreB: number | null
  playerTeam: string
}

export default async function QueuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/queue')

  const { data: session } = await supabase
    .from('sessions')
    .select('id, name, start_time, end_time, max_players, status')
    .eq('status', 'live')
    .maybeSingle()

  if (!session) {
    return (
      <QueueView
        initialState="no_session"
        session={null}
        entry={null}
        position={null}
        totalWaiting={null}
        matchData={null}
      />
    )
  }

  // Check venue check-in
  const { data: checkin } = await supabase
    .from('session_checkins')
    .select('checked_in_at')
    .eq('session_id', session.id)
    .eq('player_id', user.id)
    .maybeSingle()

  if (!checkin) {
    return (
      <QueueView
        initialState="not_checked_in"
        session={session}
        entry={null}
        position={null}
        totalWaiting={null}
        matchData={null}
      />
    )
  }

  // Get queue entry
  const { data: entry } = await supabase
    .from('queue_entries')
    .select('id, status, queue_position, checkin_deadline, break_started_at, finished_at, prompt_seen_at')
    .eq('session_id', session.id)
    .eq('player_id', user.id)
    .maybeSingle()

  if (!entry || entry.status === 'left') {
    return (
      <QueueView
        initialState="join"
        session={session}
        entry={null}
        position={null}
        totalWaiting={null}
        matchData={null}
      />
    )
  }

  let position: number | null = null
  let totalWaiting: number | null = null
  let matchData: MatchData | null = null

  if (entry.status === 'waiting') {
    const { count: ahead } = await supabase
      .from('queue_entries')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session.id)
      .eq('status', 'waiting')
      .lt('queue_position', entry.queue_position)
    position = (ahead ?? 0) + 1

    const { count: total } = await supabase
      .from('queue_entries')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session.id)
      .eq('status', 'waiting')
    totalWaiting = total ?? 0
  }

  if (['assigned', 'playing', 'finished'].includes(entry.status)) {
    // Find the most-recent match for this player in this session
    const { data: mp } = await supabase
      .from('match_players')
      .select('match_id, team')
      .eq('player_id', user.id)
      .order('match_id', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (mp) {
      const { data: match } = await supabase
        .from('matches')
        .select('id, court_id, team_a, team_b, started_at, ended_at, score_a, score_b')
        .eq('id', mp.match_id)
        .single()

      if (match) {
        const { data: court } = await supabase
          .from('courts')
          .select('name, type')
          .eq('id', match.court_id)
          .single()

        matchData = {
          matchId: match.id,
          courtName: court?.name ?? 'Court',
          courtType: court?.type ?? 'open',
          teamA: match.team_a ?? [],
          teamB: match.team_b ?? [],
          startedAt: match.started_at,
          endedAt: match.ended_at,
          scoreA: match.score_a,
          scoreB: match.score_b,
          playerTeam: mp.team,
        }
      }
    }
  }

  const stateMap: Record<string, QueueStateType> = {
    waiting: 'waiting',
    assigned: 'assigned',
    playing: 'playing',
    finished: 'finished',
    on_break: 'on_break',
    away: 'away',
  }

  return (
    <QueueView
      initialState={stateMap[entry.status] ?? 'join'}
      session={session}
      entry={entry}
      position={position}
      totalWaiting={totalWaiting}
      matchData={matchData}
    />
  )
}
