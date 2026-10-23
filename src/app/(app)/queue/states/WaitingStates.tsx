'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BigActionButton } from '@/components/ui/BigActionButton'
import { PushSubscribeButton } from '@/components/ui/PushSubscribeButton'
import { leaveQueue } from '@/app/actions/queue'

interface SessionRef {
  id: string
}

export function Waiting({
  session,
  position,
  totalWaiting,
}: {
  session: SessionRef
  position: number | null
  totalWaiting: number | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const estimate = Math.max(1, Math.round((((position ?? 1) - 1) / 4) * 20))

  function handleLeave() {
    startTransition(async () => { await leaveQueue(session.id); router.refresh() })
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading font-extrabold italic text-3xl uppercase">QUEUE</h1>
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
      <BigActionButton type="button" variant="white" size="md" disabled={pending} onClick={handleLeave}>
        Leave queue
      </BigActionButton>
      <PushSubscribeButton />
    </div>
  )
}

export function Standby({ session }: { session: SessionRef }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleLeave() {
    startTransition(async () => { await leaveQueue(session.id); router.refresh() })
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading font-extrabold italic text-3xl uppercase">QUEUE</h1>
      <div className="bg-black text-white rounded-[18px] px-5 py-7 text-center relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow rounded-full opacity-40" />
        <div className="absolute -top-1 -right-1 w-12 h-12 bg-yellow rounded-full opacity-60" />
        <div className="relative">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow animate-pulse" />
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF]">On deck</p>
          </div>
          <p className="font-heading font-extrabold italic text-5xl text-yellow uppercase leading-tight">
            GET READY!
          </p>
          <p className="text-[#BDB9AF] text-sm mt-2">You&apos;re next in line. A court will open soon.</p>
        </div>
      </div>
      <BigActionButton type="button" variant="white" size="md" disabled={pending} onClick={handleLeave}>
        Leave queue
      </BigActionButton>
      <PushSubscribeButton />
    </div>
  )
}
