export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/StatCard'
import { StatusPill } from '@/components/ui/StatusPill'
import Link from 'next/link'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">HISTORY</h1>
        <div className="bg-white border-2 border-black rounded-[18px] p-6 flex flex-col items-center gap-3 text-center">
          <p className="font-bold text-sm">Sign in to see your match history</p>
          <Link href="/login?next=/history" className="h-10 px-5 border-2 border-black rounded-[14px] bg-brand text-white text-sm font-bold flex items-center">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  const { data: myEntries } = await supabase
    .from('match_players')
    .select('match_id, team')
    .eq('player_id', user.id)

  const matchIds = myEntries?.map(e => e.match_id) ?? []

  let matches: MatchRow[] = []
  let sessionMap: Record<string, { name: string; date: string | null }> = {}
  let courtMap: Record<string, string> = {}
  let playerMap: Record<string, string> = {}

  if (matchIds.length > 0) {
    const { data: m } = await supabase
      .from('matches')
      .select('id, score_a, score_b, ended_at, team_a, team_b, court_id, session_id')
      .in('id', matchIds)
      .not('ended_at', 'is', null)
      .order('ended_at', { ascending: false })
      .limit(30)

    matches = (m ?? []) as MatchRow[]

    const sessionIds = [...new Set(matches.map(r => r.session_id))]
    const courtIds = [...new Set(matches.map(r => r.court_id))]
    const allPlayerIds = [...new Set(matches.flatMap(r => [...(r.team_a ?? []), ...(r.team_b ?? [])]))]

    const [{ data: sessions }, { data: courts }, { data: players }] = await Promise.all([
      supabase.from('sessions').select('id, name, date').in('id', sessionIds),
      supabase.from('courts').select('id, name').in('id', courtIds),
      supabase.from('profiles').select('id, name').in('id', allPlayerIds),
    ])

    for (const s of sessions ?? []) sessionMap[s.id] = { name: s.name, date: s.date }
    for (const c of courts ?? []) courtMap[c.id] = c.name
    for (const p of players ?? []) {
      if (!p.name) { playerMap[p.id] = '?'; continue }
      const parts = p.name.trim().split(' ')
      playerMap[p.id] = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
    }
  }

  const teamOf = (matchId: string) => myEntries?.find(e => e.match_id === matchId)?.team ?? 'a'

  const wins = matches.filter(m => {
    const t = teamOf(m.id)
    return t === 'a' ? (m.score_a ?? 0) > (m.score_b ?? 0) : (m.score_b ?? 0) > (m.score_a ?? 0)
  }).length

  const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : null

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading font-extrabold italic text-3xl uppercase">HISTORY</h1>

      {matches.length > 0 && (
        <StatCard cells={[
          { value: matches.length, label: 'Games' },
          { value: wins, label: 'Wins' },
          { value: winRate !== null ? `${winRate}%` : '-', label: 'Win rate' },
        ]} />
      )}

      {matches.length === 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative bg-black rounded-[18px] overflow-hidden px-5 pt-5 pb-8">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow rounded-full opacity-20" />
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow rounded-full opacity-40" />
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">History</p>
              <h1 className="font-heading font-extrabold italic text-7xl text-yellow uppercase leading-none">0</h1>
              <p className="font-heading font-extrabold italic text-3xl uppercase leading-none text-white mt-1">games played</p>
              <p className="text-[#BDB9AF] text-sm mt-3">Join a session to start your record.</p>
            </div>
          </div>
          <Link href="/events">
            <div className="w-full h-[52px] border-2 border-black bg-brand text-white rounded-[14px] font-heading font-extrabold italic text-xl uppercase flex items-center justify-center shadow-[4px_4px_0_#111]">
              FIND A SESSION
            </div>
          </Link>
          {/* Stats preview */}
          <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden">
            <div className="px-4 py-2 border-b-2 border-black bg-muted">
              <p className="text-xs font-extrabold uppercase tracking-widest text-body">Your stats will show here</p>
            </div>
            <div className="grid grid-cols-3 divide-x-2 divide-black">
              {[
                { label: 'Games', value: '-' },
                { label: 'Wins', value: '-' },
                { label: 'Win rate', value: '-' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center py-4 gap-1">
                  <span className="font-heading font-extrabold italic text-3xl text-body">{s.value}</span>
                  <span className="text-xs text-body">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-extrabold uppercase tracking-widest text-body px-1">After each game</p>
            {[
              { icon: '🏆', title: 'Win/loss tracked', body: 'Every game you play is logged with the score and opponents.' },
              { icon: '📊', title: 'Win rate calculated', body: 'See your win percentage build as you play more sessions.' },
              { icon: '👥', title: 'Players you\'ve faced', body: 'Your match history shows who was on each court with you.' },
            ].map(item => (
              <div key={item.title} className="bg-white border-2 border-black rounded-[16px] p-3 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-muted border-2 border-black flex items-center justify-center shrink-0 text-base">{item.icon}</div>
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs text-body mt-0.5">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {matches.map(m => {
          const team = teamOf(m.id)
          const myTeam = (team === 'a' ? m.team_a : m.team_b) ?? []
          const opTeam = (team === 'a' ? m.team_b : m.team_a) ?? []
          const myScore = team === 'a' ? (m.score_a ?? null) : (m.score_b ?? null)
          const opScore = team === 'a' ? (m.score_b ?? null) : (m.score_a ?? null)
          const hasScore = myScore !== null || opScore !== null
          const won = hasScore && (myScore ?? 0) > (opScore ?? 0)
          const session = sessionMap[m.session_id]
          const courtName = courtMap[m.court_id] ?? 'Court'
          const myNames = myTeam.map(id => id === user.id ? 'You' : (playerMap[id] ?? '?'))
          const opNames = opTeam.map(id => playerMap[id] ?? '?')

          return (
            <div key={m.id} className="bg-white border-2 border-black rounded-[18px] p-4 flex gap-3">
              <div className={`w-1 rounded-full shrink-0 self-stretch ${won ? 'bg-yellow' : 'bg-muted'}`} />
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{session?.name ?? 'Session'}</p>
                    <p className="text-xs text-body">{formatDate(session?.date ?? null)} · {courtName}</p>
                  </div>
                  <StatusPill variant={!hasScore ? 'muted' : won ? 'yellow' : 'outline'}>
                    {!hasScore ? 'No score' : won ? 'Win' : 'Loss'}
                  </StatusPill>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-sm font-semibold truncate">{myNames.join(' & ')}</p>
                    <p className="text-xs text-body truncate">vs {opNames.join(' & ')}</p>
                  </div>
                  {hasScore && (
                    <p className="font-heading font-extrabold italic text-2xl leading-none shrink-0">
                      {myScore}–{opScore}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type MatchRow = {
  id: string
  score_a: number | null
  score_b: number | null
  ended_at: string | null
  team_a: string[] | null
  team_b: string[] | null
  court_id: string
  session_id: string
}

function formatDate(date: string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })
}
