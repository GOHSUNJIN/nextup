'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { startSession } from '@/app/actions/sessions'

export function StartSessionButton({ sessionId }: { sessionId: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleStart() {
    startTransition(async () => {
      await startSession(sessionId)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleStart}
      disabled={pending}
      className="h-9 px-4 rounded-[12px] border-2 border-black bg-black text-white text-xs font-bold shrink-0 disabled:opacity-50"
    >
      {pending ? '…' : 'Start'}
    </button>
  )
}
