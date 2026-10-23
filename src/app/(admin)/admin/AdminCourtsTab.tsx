import { createClient } from '@/lib/supabase/server'
import { StatusPill } from '@/components/ui/StatusPill'
import { EndMatchForm } from './EndMatchForm'
import { CourtTypeSelect } from './CourtTypeSelect'
import Link from 'next/link'

type Session = { id: string; name: string } | null

export async function AdminCourtsTab({ session }: { session: Session }) {
  if (!session) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-body text-sm">No live session right now.</p>
        <Link href="/admin/events/new" className="text-sm font-bold underline">Create an event</Link>
      </div>
    )
  }

  const supabase = await createClient()

  const { data: courts } = await supabase
    .from('courts')
    .select('id, name, type, status')
    .eq('session_id', session.id)
    .order('name')

  const { data: activeMatches } = await supabase
    .from('matches')
    .select('id, court_id, started_at, team_a, team_b')
    .eq('session_id', session.id)
    .is('ended_at', null)

  const allPlayerIds = [...new Set((activeMatches ?? []).flatMap(m => [...(m.team_a ?? []), ...(m.team_b ?? [])]))]

  let playerNames: Record<string, string> = {}
  if (allPlayerIds.length > 0) {
    const { data: players } = await supabase.from('profiles').select('id, name').in('id', allPlayerIds)
    for (const p of players ?? []) {
      if (p.name) {
        const parts = p.name.trim().split(' ')
        playerNames[p.id] = parts.length > 1 ? `${parts[0]} ${parts[parts.length-1][0]}.` : parts[0]
      }
    }
  }

  const matchByCourt = Object.fromEntries(
    (activeMatches ?? []).map(m => [m.court_id, m])
  )

  return (
    <div className="flex flex-col gap-3">
      {courts?.map(court => {
        const match = matchByCourt[court.id]
        const teamA = match ? (match.team_a ?? []).map((id: string) => playerNames[id] ?? '?').join(' & ') : null
        const teamB = match ? (match.team_b ?? []).map((id: string) => playerNames[id] ?? '?').join(' & ') : null

        return (
          <div key={court.id} className="bg-white border-2 border-black rounded-[18px] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[15px] flex-1">{court.name}</span>
              <CourtTypeSelect courtId={court.id} currentType={court.type} />
              <StatusPill variant={court.status === 'playing' ? 'live' : court.status === 'assigned' ? 'yellow' : 'muted'}>
                {court.status === 'playing' ? 'Playing' : court.status === 'assigned' ? 'Checking in' : 'Empty'}
              </StatusPill>
            </div>

            {teamA && teamB && (
              <p className="text-sm text-body">
                <span className="font-semibold text-black">{teamA}</span>
                <span className="px-2 font-bold">vs</span>
                <span className="font-semibold text-black">{teamB}</span>
              </p>
            )}

            {match && (court.status === 'playing' || court.status === 'assigned') && (
              <EndMatchForm matchId={match.id} />
            )}
          </div>
        )
      })}

      {!courts?.length && (
        <p className="text-body text-sm text-center py-4">No courts configured for this session.</p>
      )}
    </div>
  )
}
