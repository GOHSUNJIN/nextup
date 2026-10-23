'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { markPromptSeen } from '@/app/actions/queue'
import { NoSession, SessionEnded } from './states/IdleStates'
import { NotCheckedIn, JoinQueue, Waitlist } from './states/CheckinStates'
import { Waiting, Standby } from './states/WaitingStates'
import { Assigned, Playing, Finished } from './states/MatchStates'
import { OnBreak, Away } from './states/BreakStates'
import type { QueueStateType, MatchData } from '@/types/queue'

interface Props {
  initialState: QueueStateType
  session: { id: string; name: string; start_time: string; end_time: string; status?: string } | null
  entry: {
    id: string; status: string; queue_position: number
    checkin_deadline?: string | null; break_started_at?: string | null
    requeue_deadline?: string | null; prompt_seen_at?: string | null
  } | null
  position: number | null
  totalWaiting: number | null
  matchData: MatchData | null
  waitlistPosition: number | null
}

export function QueueView({ initialState, session, entry, position, totalWaiting, matchData, waitlistPosition }: Props) {
  const router = useRouter()
  const promptCalledRef = useRef(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  useEffect(() => {
    if (!session) return
    const supabase = createClient()
    const ch = supabase.channel('queue-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries', filter: `session_id=eq.${session.id}` }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courts', filter: `session_id=eq.${session.id}` }, () => router.refresh())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${session.id}` }, () => router.refresh())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [session, router])

  useEffect(() => {
    if (initialState !== 'finished' || !session || promptCalledRef.current || entry?.prompt_seen_at) return
    promptCalledRef.current = true
    markPromptSeen(session.id)
  }, [initialState, session, entry?.prompt_seen_at])

  if (initialState === 'no_session') return <NoSession />
  if (initialState === 'session_ended') return <SessionEnded sessionName={session?.name} />
  if (initialState === 'not_checked_in') return <NotCheckedIn session={session!} />
  if (initialState === 'join') return <JoinQueue session={session!} />
  if (initialState === 'waitlist') return <Waitlist session={session!} waitlistPosition={waitlistPosition} />
  if (initialState === 'waiting') return <Waiting session={session!} position={position} totalWaiting={totalWaiting} />
  if (initialState === 'standby') return <Standby session={session!} />
  if (initialState === 'assigned') return <Assigned matchData={matchData!} entry={entry!} />
  if (initialState === 'playing') return <Playing matchData={matchData!} />
  if (initialState === 'finished') return <Finished session={session!} matchData={matchData} entry={entry!} />
  if (initialState === 'on_break') return <OnBreak session={session!} breakStartedAt={entry?.break_started_at} />
  if (initialState === 'away') return <Away session={session!} />

  return null
}
