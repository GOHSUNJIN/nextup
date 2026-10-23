'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BigActionButton } from '@/components/ui/BigActionButton'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import {
  venueCheckIn,
  joinQueue,
  leaveQueue,
  playerCheckIn,
  requeueOrBreak,
  rejoinQueue,
  markDone,
} from '@/app/actions/queue'
import { createClient } from '@/lib/supabase/client'
import type { QueueStateType, MatchData } from './page'

interface Props {
  initialState: QueueStateType
  session: { id: string; name: string; start_time: string; end_time: string } | null
  entry: {
    id: string
    status: string
    queue_position: number
    checkin_deadline?: string | null
    break_started_at?: string | null
  } | null
  position: number | null
  totalWaiting: number | null
  matchData: MatchData | null
}

export function QueueView({
  initialState,
  session,
  entry,
  position,
  totalWaiting,
  matchData,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Realtime: refresh page when queue_entries or courts change for this session
  useEffect(() => {
    if (!session) return
    const supabase = createClient()
    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `session_id=eq.${session.id}`,
        },
        () => { router.refresh() }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courts',
          filter: `session_id=eq.${session.id}`,
        },
        () => { router.refresh() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session, router])

  function handleCheckIn() {
    if (!code || code.length !== 4 || !session) return
    setError(null)
    startTransition(async () => {
      const result = await venueCheckIn(session.id, code)
      if (result?.error) setError(result.error)
      else router.refresh()
    })
  }

  function handleJoin() {
    if (!session) return
    startTransition(async () => {
      const result = await joinQueue(session.id)
      if (result?.error) setError(result.error as string)
      else router.refresh()
    })
  }

  function handleLeave() {
    if (!session) return
    startTransition(async () => {
      await leaveQueue(session.id)
      router.refresh()
    })
  }

  function handlePlayerCheckIn() {
    if (!matchData) return
    startTransition(async () => {
      await playerCheckIn(matchData.matchId)
      router.refresh()
    })
  }

  function handleRequeue() {
    if (!session) return
    startTransition(async () => {
      await requeueOrBreak(session.id, 'requeue')
      router.refresh()
    })
  }

  function handleBreak() {
    if (!session) return
    startTransition(async () => {
      await requeueOrBreak(session.id, 'break')
      router.refresh()
    })
  }

  function handleRejoin() {
    if (!session) return
    startTransition(async () => {
      await rejoinQueue(session.id)
      router.refresh()
    })
  }

  function handleDone() {
    if (!session) return
    startTransition(async () => {
      await markDone(session.id)
      router.refresh()
    })
  }

  // ── STATE: no live session ──
  if (initialState === 'no_session') {
    return (
      <div className="flex flex-col gap-4">
        <div className="relative bg-black rounded-[18px] overflow-hidden px-5 pt-5 pb-6">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow rounded-full opacity-90" />
          <div className="absolute -top-3 -right-3 w-14 h-14 bg-yellow rounded-full" />
          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">Queue</p>
            <h1 className="font-heading font-extrabold italic text-5xl uppercase leading-none text-white">
              No session<br />live
            </h1>
            <p className="text-[#BDB9AF] text-sm mt-3">Check back when an event starts.</p>
          </div>
        </div>
      </div>
    )
  }

  // ── STATE: not checked in at venue ──
  if (initialState === 'not_checked_in') {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">CHECK IN</h1>

        <div className="bg-black text-white rounded-[18px] px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow border-2 border-black flex items-center justify-center shrink-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm">{session!.name}</p>
            <p className="text-[#BDB9AF] text-xs">Enter the code to prove you&apos;re at the venue</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">4-digit venue code</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={4}
            placeholder="0000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="h-14 rounded-[12px] border-2 border-black bg-white px-4 text-3xl font-heading font-extrabold italic text-center tracking-[0.3em] outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {error && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>
        )}

        <BigActionButton
          type="button"
          size="lg"
          disabled={pending || code.length !== 4}
          onClick={handleCheckIn}
        >
          {pending ? 'Checking in…' : 'CHECK IN'}
        </BigActionButton>
      </div>
    )
  }

  // ── STATE: join queue ──
  if (initialState === 'join') {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">QUEUE</h1>

        <div className="bg-success-bg border-2 border-black rounded-[18px] px-4 py-3 flex items-center gap-2.5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#17603A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-sm font-bold text-success-text">You&apos;re checked in at the venue</p>
        </div>

        {error && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>
        )}

        <BigActionButton type="button" size="lg" disabled={pending} onClick={handleJoin}>
          {pending ? 'Joining…' : 'JOIN QUEUE'}
        </BigActionButton>

        <p className="text-center text-xs text-body">
          You&apos;ll be assigned to a court automatically when it&apos;s your turn.
        </p>
      </div>
    )
  }

  // ── STATE: waiting in queue ──
  if (initialState === 'waiting') {
    const estimate = Math.max(1, Math.round((((position ?? 1) - 1) / 4) * 20))
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">QUEUE</h1>

        {/* Position hero */}
        <div className="bg-black text-white rounded-[18px] px-5 py-6 text-center relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow rounded-full opacity-20" />
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-1">
            Your position
          </p>
          <p className="font-heading font-extrabold italic text-8xl text-yellow leading-none">
            #{position ?? '–'}
          </p>
          <p className="text-[#BDB9AF] text-sm mt-2">
            {totalWaiting ?? 0} waiting · ~{estimate} min
          </p>
        </div>

        <BigActionButton
          type="button"
          variant="white"
          size="md"
          disabled={pending}
          onClick={handleLeave}
        >
          Leave queue
        </BigActionButton>
      </div>
    )
  }

  // ── STATE: assigned (you're up!) ──
  if (initialState === 'assigned') {
    const deadline =
      entry?.checkin_deadline ?? new Date(Date.now() + 3 * 60 * 1000).toISOString()
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-black text-white rounded-[18px] px-5 py-7 text-center relative overflow-hidden">
          {/* Yellow burst */}
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-yellow rounded-full opacity-80" />
          <div className="absolute -top-2 -right-2 w-14 h-14 bg-yellow rounded-full" />
          <div className="relative">
            <p className="font-heading font-extrabold italic text-5xl text-yellow uppercase leading-tight">
              YOU&apos;RE UP!
            </p>
            <p className="text-2xl font-bold mt-1">{matchData?.courtName ?? 'A court'}</p>
            <div className="mt-4 text-[#BDB9AF] text-sm flex items-center justify-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <CountdownTimer deadline={deadline} className="text-white text-sm" /> left to check in
            </div>
          </div>
        </div>

        <BigActionButton
          type="button"
          size="lg"
          disabled={pending}
          onClick={handlePlayerCheckIn}
        >
          {pending ? 'Checking in…' : "I'M HERE!"}
        </BigActionButton>
      </div>
    )
  }

  // ── STATE: playing ──
  if (initialState === 'playing') {
    const mins = matchData?.startedAt
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
              {matchData?.courtName ?? 'Your court'}
            </p>
            {mins !== null && (
              <p className="text-[#BDB9AF] text-sm mt-2">{mins} min played</p>
            )}
          </div>
        </div>
        {matchData?.teamA && matchData?.teamB && (
          <div className="bg-white border-2 border-black rounded-[18px] p-4 flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="text-xs text-body mb-1">Your team</p>
              <p className="font-bold text-sm">{matchData.teamA}</p>
            </div>
            <span className="font-heading font-extrabold italic text-xl text-body">vs</span>
            <div className="flex-1 text-center">
              <p className="text-xs text-body mb-1">Opponents</p>
              <p className="font-bold text-sm">{matchData.teamB}</p>
            </div>
          </div>
        )}
        <p className="text-center text-xs text-body">Admin ends the match when it&apos;s done.</p>
      </div>
    )
  }

  // ── STATE: finished ──
  if (initialState === 'finished') {
    const scoreA = matchData?.scoreA
    const scoreB = matchData?.scoreB
    const playerTeam = matchData?.playerTeam
    const myScore = playerTeam === 'a' ? scoreA : scoreB
    const oppScore = playerTeam === 'a' ? scoreB : scoreA
    const hasScore = myScore != null && oppScore != null
    const won = hasScore && myScore! > oppScore!

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

  // ── STATE: on break ──
  if (initialState === 'on_break') {
    const breakStarted = entry?.break_started_at
    const breakDeadline = breakStarted
      ? new Date(new Date(breakStarted).getTime() + 30 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 60 * 1000).toISOString()

    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">ON BREAK</h1>
        <div className="bg-black text-white rounded-[18px] px-5 py-7 text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">
            Break ends in
          </p>
          <CountdownTimer
            deadline={breakDeadline}
            className="text-5xl text-yellow"
            onExpire={() => router.refresh()}
          />
          <p className="text-[#BDB9AF] text-xs mt-3">
            You&apos;ll be moved to &quot;Away&quot; after 30 min
          </p>
        </div>
        <BigActionButton type="button" size="lg" disabled={pending} onClick={handleRejoin}>
          {pending ? '…' : 'REJOIN QUEUE'}
        </BigActionButton>
        <BigActionButton
          type="button"
          variant="white"
          size="md"
          disabled={pending}
          onClick={handleDone}
        >
          I&apos;m done for tonight
        </BigActionButton>
      </div>
    )
  }

  // ── STATE: away ──
  if (initialState === 'away') {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-black text-white rounded-[18px] px-5 py-7 text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">Status</p>
          <p className="font-heading font-extrabold italic text-5xl text-[#BDB9AF] uppercase leading-none">
            AWAY
          </p>
          <p className="text-[#BDB9AF] text-sm mt-3">
            Break time expired. You can still rejoin anytime.
          </p>
        </div>
        <BigActionButton type="button" size="lg" disabled={pending} onClick={handleRejoin}>
          {pending ? '…' : 'REJOIN QUEUE'}
        </BigActionButton>
        <BigActionButton type="button" variant="white" size="md" disabled={pending} onClick={handleDone}>
          I&apos;m done for tonight
        </BigActionButton>
      </div>
    )
  }

  return null
}
