'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BigActionButton } from '@/components/ui/BigActionButton'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { playerCheckIn } from '@/app/actions/checkin'
import { requeueOrBreak } from '@/app/actions/queue'
import type { MatchData } from '@/types/queue'

interface SessionRef {
  id: string
}

interface EntryRef {
  checkin_deadline?: string | null
  requeue_deadline?: string | null
}

export function Assigned({
  matchData,
  entry,
}: {
  matchData: MatchData
  entry: EntryRef
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const deadline = entry.checkin_deadline ?? new Date(Date.now() + 3 * 60 * 1000).toISOString()

  function handleCheckIn() {
    startTransition(async () => { await playerCheckIn(matchData.matchId); router.refresh() })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-black text-white rounded-[18px] px-5 py-7 text-center relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-yellow rounded-full opacity-80" />
        <div className="absolute -top-2 -right-2 w-14 h-14 bg-yellow rounded-full" />
        <div className="relative">
          <p className="font-heading font-extrabold italic text-5xl text-yellow uppercase leading-tight">
            YOU&apos;RE UP!
          </p>
          <p className="text-2xl font-bold mt-1">{matchData.courtName}</p>
          <div className="mt-4 text-[#BDB9AF] text-sm flex items-center justify-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <CountdownTimer deadline={deadline} className="text-white text-sm" /> left to check in
          </div>
        </div>
      </div>
      <BigActionButton type="button" size="lg" disabled={pending} onClick={handleCheckIn}>
        {pending ? 'Checking in…' : "I'M HERE!"}
      </BigActionButton>
    </div>
  )
}

export function Playing({ matchData }: { matchData: MatchData }) {
  const mins = matchData.startedAt
    ? Math.floor((Date.now() - new Date(matchData.startedAt).getTime()) / 60000)
    : null

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-black text-white rounded-[18px] px-5 py-6 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow rounded-full opacity-20" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF]">Live match</p>
          </div>
          <p className="font-heading font-extrabold italic text-5xl text-yellow uppercase leading-none">
            {matchData.courtName}
          </p>
          {mins !== null && (
            <p className="text-[#BDB9AF] text-sm mt-2">{mins} min played</p>
          )}
        </div>
      </div>
      {matchData.teamA.length > 0 && matchData.teamB.length > 0 && (
        <div className="bg-white border-2 border-black rounded-[18px] p-4 flex items-center gap-3">
          <div className="flex-1 text-center">
            <p className="text-xs text-body mb-1">Your team</p>
            <p className="font-bold text-sm">{matchData.teamA.join(' & ')}</p>
          </div>
          <span className="font-heading font-extrabold italic text-xl text-body">vs</span>
          <div className="flex-1 text-center">
            <p className="text-xs text-body mb-1">Opponents</p>
            <p className="font-bold text-sm">{matchData.teamB.join(' & ')}</p>
          </div>
        </div>
      )}
      <p className="text-center text-xs text-body">Admin ends the match when it&apos;s done.</p>
    </div>
  )
}

export function Finished({
  session,
  matchData,
  entry,
}: {
  session: SessionRef
  matchData: MatchData | null
  entry: EntryRef
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const myScore = matchData?.playerTeam === 'a' ? matchData?.scoreA : matchData?.scoreB
  const oppScore = matchData?.playerTeam === 'a' ? matchData?.scoreB : matchData?.scoreA
  const hasScore = myScore != null && oppScore != null
  const won = hasScore && myScore! > oppScore!
  const timerDeadline = entry.requeue_deadline ?? new Date(Date.now() + 60_000).toISOString()

  function handleRequeue() {
    startTransition(async () => { await requeueOrBreak(session.id, 'requeue'); router.refresh() })
  }

  function handleBreak() {
    startTransition(async () => { await requeueOrBreak(session.id, 'break'); router.refresh() })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-black text-white rounded-[18px] px-5 py-8 text-center relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-yellow rounded-full opacity-20" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-3">
            {matchData?.courtName ?? 'Match finished'}
          </p>
          <p className="font-heading font-extrabold italic text-6xl text-yellow uppercase leading-none">
            {won ? 'YOU WON!' : 'GOOD GAME!'}
          </p>
          {hasScore && (
            <p className="font-heading font-extrabold italic text-4xl text-white mt-3">
              {myScore} – {oppScore}
            </p>
          )}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[#BDB9AF] text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            Auto-break in{' '}
            <CountdownTimer deadline={timerDeadline} className="text-white text-sm ml-0.5" onExpire={handleBreak} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <BigActionButton type="button" size="lg" disabled={pending} onClick={handleRequeue}>
          {pending ? '…' : 'REJOIN QUEUE'}
        </BigActionButton>
        <BigActionButton type="button" variant="white" size="md" disabled={pending} onClick={handleBreak}>
          Take a break
        </BigActionButton>
      </div>
    </div>
  )
}
