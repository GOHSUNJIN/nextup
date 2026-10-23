export type QueueStateType =
  | 'no_session'
  | 'session_ended'
  | 'not_checked_in'
  | 'join'
  | 'waitlist'
  | 'waiting'
  | 'standby'
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
