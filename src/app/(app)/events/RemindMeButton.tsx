'use client'
import { useState, useTransition } from 'react'
import { toggleReminder } from '@/app/actions/sessions'

export function RemindMeButton({ sessionId, initialState }: { sessionId: string; initialState: boolean }) {
  const [reminded, setReminded] = useState(initialState)
  const [pending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await toggleReminder(sessionId)
      setReminded(r => !r)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`h-8 px-3 rounded-full border-2 border-black text-xs font-bold transition-colors ${reminded ? 'bg-yellow' : 'bg-white'}`}
    >
      {reminded ? 'Reminded ✓' : 'Remind me'}
    </button>
  )
}
