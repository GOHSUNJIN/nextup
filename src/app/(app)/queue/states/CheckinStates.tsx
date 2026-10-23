'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BigActionButton } from '@/components/ui/BigActionButton'
import { PushSubscribeButton } from '@/components/ui/PushSubscribeButton'
import { venueCheckIn } from '@/app/actions/checkin'
import { joinQueue, leaveQueue } from '@/app/actions/queue'

interface SessionRef {
  id: string
  name: string
}

export function NotCheckedIn({ session }: { session: SessionRef }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleCheckIn() {
    setError(null)
    startTransition(async () => {
      const r = await venueCheckIn(session.id, code)
      if (r?.error) setError(r.error)
      else router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading font-extrabold italic text-3xl uppercase">CHECK IN</h1>
      <div className="bg-black text-white rounded-[18px] px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-yellow border-2 border-black flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-sm">{session.name}</p>
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
      {error && <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>}
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

export function JoinQueue({ session }: { session: SessionRef }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleJoin() {
    setError(null)
    startTransition(async () => {
      const r = await joinQueue(session.id)
      if (r?.error) setError(r.error as string)
      else router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading font-extrabold italic text-3xl uppercase">QUEUE</h1>
      <div className="bg-success-bg border-2 border-black rounded-[18px] px-4 py-3 flex items-center gap-2.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#17603A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <p className="text-sm font-bold text-success-text">You&apos;re checked in at the venue</p>
      </div>
      {error && <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>}
      <BigActionButton type="button" size="lg" disabled={pending} onClick={handleJoin}>
        {pending ? 'Joining…' : 'JOIN QUEUE'}
      </BigActionButton>
      <p className="text-center text-xs text-body">You&apos;ll be assigned to a court automatically.</p>
    </div>
  )
}

export function Waitlist({
  session,
  waitlistPosition,
}: {
  session: SessionRef
  waitlistPosition: number | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleLeave() {
    startTransition(async () => {
      await leaveQueue(session.id)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading font-extrabold italic text-3xl uppercase">WAITLIST</h1>
      <div className="bg-black text-white rounded-[18px] px-5 py-6 text-center relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow rounded-full opacity-10" />
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-1">
          Waitlist position
        </p>
        <p className="font-heading font-extrabold italic text-8xl text-[#BDB9AF] leading-none">
          #{waitlistPosition ?? '–'}
        </p>
        <p className="text-[#BDB9AF] text-sm mt-2">
          Session is full. You&apos;ll be promoted when a spot opens.
        </p>
      </div>
      <BigActionButton type="button" variant="white" size="md" disabled={pending} onClick={handleLeave}>
        Leave waitlist
      </BigActionButton>
      <PushSubscribeButton />
    </div>
  )
}
