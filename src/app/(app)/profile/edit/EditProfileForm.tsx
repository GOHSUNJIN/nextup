'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateProfile } from '@/app/actions/auth'
import { BigActionButton } from '@/components/ui/BigActionButton'

export function EditProfileForm({ name, phone }: { name: string; phone: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center bg-white shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">EDIT PROFILE</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" htmlFor="name">Full name</label>
          <input
            id="name" name="name" type="text" required autoComplete="name"
            defaultValue={name}
            className="h-12 rounded-[12px] border-2 border-black bg-white px-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" htmlFor="phone">
            Phone <span className="text-body font-normal">(optional)</span>
          </label>
          <input
            id="phone" name="phone" type="tel" autoComplete="tel"
            defaultValue={phone}
            placeholder="+65 9123 4567"
            className="h-12 rounded-[12px] border-2 border-black bg-white px-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {error && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>
        )}

        <BigActionButton type="submit" disabled={pending} size="lg">
          {pending ? 'Saving…' : 'SAVE CHANGES'}
        </BigActionButton>
      </form>
    </div>
  )
}
