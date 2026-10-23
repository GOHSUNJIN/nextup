export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { QueueView } from './QueueView'
import type { QueueStateType, MatchData } from '@/types/queue'

export type { QueueStateType, MatchData }

const ACTIVE_STATUSES = ['waiting', 'standby'] as const
const MATCH_STATUSES = ['assigned', 'playing', 'finished'] as const

export default async function QueuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/queue')

  const { data: session } = await supabase
    .from('sessions')
    .select('id, name, start_time, end_time, max_players, status')
    .in('status', ['live', 'ended'])
    .order('start_time', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!session) {
    return <QueueView initialState="no_session" session={null} entry={null} position={null} totalWaiting={null} matchData={null} waitlistPosition={null} />
  }

  if (session.status === 'ended') {
    const { data: wasIn } = await supabase
      .from('queue_entries').select('id')
      .eq('session_id', session.id).eq('player_id', user.id).maybeSingle()

    const state = wasIn ? 'session_ended' : 'no_session'
    return <QueueView initialState={state} session={wasIn ? session : null} entry={null} position={null} totalWaiting={null} matchData={null} waitlistPosition={null} />
  }

  const { data: checkin } = await supabase
    .from('session_checkins').select('checked_in_at')
    .eq('session_id', session.id).eq('player_id', user.id).maybeSingle()

  if (!checkin) {
    return <QueueView initialState="not_checked_in" session={session} entry={null} position={null} totalWaiting={null} matchData={null} waitlistPosition={null} />
  }

  const { data: entry } = await supabase
    .from('queue_entries')
    .select('id, status, queue_position, checkin_deadline, break_started_at, finished_at, prompt_seen_at, requeue_deadline')
    .eq('session_id', session.id).eq('player_id', user.id).maybeSingle()

  if (!entry || entry.status === 'left') {
    return <QueueView initialState="join" session={session} entry={null} position={null} totalWaiting={null} matchData={null} waitlistPosition={null} />
  }

  const admin = createAdminClient()
  let position: number | null = null
  let totalWaiting: number | null = null
  let waitlistPosition: number | null = null
  let matchData: MatchData | null = null

  if ((ACTIVE_STATUSES as readonly string[]).includes(entry.status)) {
    const [aheadResult, totalResult] = await Promise.all([
      admin.from('queue_entries').select('id', { count: 'exact', head: true })
        .eq('session_id', session.id).in('status', ['waiting', 'standby'])
        .lt('queue_position', entry.queue_position),
      admin.from('queue_entries').select('id', { count: 'exact', head: true })
        .eq('session_id', session.id).in('status', ['waiting', 'standby']),
    ])
    position = (aheadResult.count ?? 0) + 1
    totalWaiting = totalResult.count ?? 0
  }

  if (entry.status === 'waitlist') {
    const { count } = await admin
      .from('queue_entries').select('id', { count: 'exact', head: true })
      .eq('session_id', session.id).eq('status', 'waitlist')
      .lt('queue_position', entry.queue_position)
    waitlistPosition = (count ?? 0) + 1
  }

  if ((MATCH_STATUSES as readonly string[]).includes(entry.status)) {
    const { data: mp } = await supabase
      .from('match_players').select('match_id, team')
      .eq('player_id', user.id)
      .order('match_id', { ascending: false }).limit(1).maybeSingle()

    if (mp) {
      const { data: match } = await supabase
        .from('matches').select('id, court_id, team_a, team_b, started_at, ended_at, score_a, score_b')
        .eq('id', mp.match_id).single()

      if (match) {
        const { data: court } = await supabase
          .from('courts').select('name, type').eq('id', match.court_id).single()
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
    waiting: 'waiting', standby: 'standby', waitlist: 'waitlist',
    assigned: 'assigned', playing: 'playing', finished: 'finished',
    on_break: 'on_break', away: 'away',
  }

  return (
    <QueueView
      initialState={stateMap[entry.status] ?? 'join'}
      session={session}
      entry={entry}
      position={position}
      totalWaiting={totalWaiting}
      matchData={matchData}
      waitlistPosition={waitlistPosition}
    />
  )
}
