'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BigActionButton } from '@/components/ui/BigActionButton'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { rejoinQueue, markDone } from '@/app/actions/queue'

const BREAK_DURATION_MS = 30 * 60 * 1000

interface SessionRef {
  id: string
}

export function OnBreak({
  session,
  breakStartedAt,
}: {
  session: SessionRef
  breakStartedAt: string | null | undefined
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const breakDeadline = breakStartedAt
    ? new Date(new Date(breakStartedAt).getTime() + BREAK_DURATION_MS).toISOString()
    : new Date(Date.now() + BREAK_DURATION_MS).toISOString()

  function handleRejoin() {
    startTransition(async () => { await rejoinQueue(session.id); router.refresh() })
  }

  function handleDone() {
    startTransition(async () => { await markDone(session.id); router.refresh() })
  }

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
        <p className="text-[#BDB9AF] text-xs mt-3">You&apos;ll be moved to &quot;Away&quot; after 30 min</p>
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

export function Away({ session }: { session: SessionRef }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleRejoin() {
    startTransition(async () => { await rejoinQueue(session.id); router.refresh() })
  }

  function handleDone() {
    startTransition(async () => { await markDone(session.id); router.refresh() })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-black text-white rounded-[18px] px-5 py-7 text-center">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">Status</p>
        <p className="font-heading font-extrabold italic text-5xl text-[#BDB9AF] uppercase leading-none">
          AWAY
        </p>
        <p className="text-[#BDB9AF] text-sm mt-3">Break time expired. You can still rejoin.</p>
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
