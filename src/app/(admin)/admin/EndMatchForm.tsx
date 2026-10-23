'use client'
import { useState, useTransition } from 'react'
import { endMatch } from '@/app/actions/sessions'

export function EndMatchForm({ matchId }: { matchId: string }) {
  const [open, setOpen] = useState(false)
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [pending, startTransition] = useTransition()

  function handleEnd() {
    startTransition(async () => {
      await endMatch(matchId, scoreA, scoreB)
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full h-10 rounded-[12px] border-2 border-black bg-black text-white text-sm font-bold"
      >
        End match
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-extrabold uppercase tracking-widest text-body">Score</p>
      <div className="flex gap-2 items-center">
        <input
          type="number" min={0} max={11} value={scoreA}
          onChange={e => setScoreA(parseInt(e.target.value) || 0)}
          className="w-16 h-10 rounded-[10px] border-2 border-black text-center text-sm font-bold"
        />
        <span className="text-body font-bold">–</span>
        <input
          type="number" min={0} max={11} value={scoreB}
          onChange={e => setScoreB(parseInt(e.target.value) || 0)}
          className="w-16 h-10 rounded-[10px] border-2 border-black text-center text-sm font-bold"
        />
        <button
          onClick={handleEnd}
          disabled={pending}
          className="flex-1 h-10 rounded-[12px] border-2 border-black bg-brand text-white text-sm font-bold"
        >
          {pending ? '...' : 'Confirm'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="h-10 px-3 rounded-[12px] border-2 border-black text-sm font-bold"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
