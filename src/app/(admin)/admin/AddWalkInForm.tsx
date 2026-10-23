'use client'
import { useState, useTransition } from 'react'
import { addWalkIn } from '@/app/actions/sessions'

export function AddWalkInForm({ sessionId }: { sessionId: string }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await addWalkIn(sessionId, name.trim(), gender)
      if (result?.error) setError(result.error)
      else setName('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-black rounded-[18px] p-4 flex flex-col gap-3">
      <p className="text-xs font-extrabold uppercase tracking-widest text-body">Add walk-in</p>
      <input
        type="text" placeholder="Player name" value={name} onChange={e => setName(e.target.value)}
        className="h-11 rounded-[12px] border-2 border-black px-3 text-sm font-medium"
        required
      />
      <div className="flex gap-2">
        {(['male', 'female'] as const).map(g => (
          <label key={g} className="flex-1">
            <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} className="sr-only peer" />
            <span className="flex h-10 items-center justify-center rounded-[12px] border-2 border-black text-sm font-bold capitalize cursor-pointer peer-checked:bg-black peer-checked:text-white transition-colors">
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-danger-text">{error}</p>}
      <button
        type="submit" disabled={pending || !name.trim()}
        className="h-10 rounded-[12px] border-2 border-black bg-black text-white text-sm font-bold disabled:opacity-50"
      >
        {pending ? 'Adding…' : 'Add to queue'}
      </button>
    </form>
  )
}
