'use client'
import { useTransition } from 'react'
import { changeCourtType } from '@/app/actions/admin'

const TYPES = ['open', 'strong', 'casual', 'women', 'mixed'] as const

export function CourtTypeSelect({ courtId, currentType }: { courtId: string; currentType: string }) {
  const [pending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const type = e.target.value
    startTransition(async () => {
      await changeCourtType(courtId, type)
    })
  }

  return (
    <select
      defaultValue={currentType}
      onChange={handleChange}
      disabled={pending}
      className="h-8 rounded-full border-2 border-black text-xs font-bold px-2 bg-white capitalize"
    >
      {TYPES.map(t => (
        <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
      ))}
    </select>
  )
}
