'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { PasswordInput } from '@/components/ui/PasswordInput'

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signUp(fd)
      if (result?.error) setError(result.error)
    })
  }

  const input = "h-11 rounded-[12px] border-2 border-black/20 bg-white/10 text-white placeholder-white/40 px-3.5 text-sm font-medium outline-none focus:border-yellow focus:bg-white/15 transition-colors"

  return (
    <div className="flex flex-col gap-4">
      {/* Compact header */}
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="w-9 h-9 rounded-full border-2 border-white/20 flex items-center justify-center text-white shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#BDB9AF]">NextUp</p>
          <h1 className="font-heading font-extrabold italic text-3xl uppercase leading-none text-white">
            Create <span className="text-yellow">Account</span>
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          name="name" type="text" required autoComplete="name"
          placeholder="Full name"
          className={input}
        />
        <input
          name="email" type="email" required autoComplete="email"
          placeholder="Email"
          className={input}
        />
        <input
          name="phone" type="tel" autoComplete="tel"
          placeholder="Phone (optional)"
          className={input}
        />
        <PasswordInput
          name="password" autoComplete="new-password" minLength={8}
          placeholder="Password (min. 8 characters)"
          className={input}
        />

        {/* Gender */}
        <div className="flex gap-2">
          {(['male', 'female'] as const).map(g => (
            <label key={g} className="flex-1">
              <input type="radio" name="gender" value={g} required className="sr-only peer" />
              <span className="flex h-11 items-center justify-center rounded-[12px] border-2 border-white/20 bg-white/10 text-white/60 text-sm font-bold capitalize cursor-pointer peer-checked:bg-yellow peer-checked:text-black peer-checked:border-yellow transition-colors">
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </span>
            </label>
          ))}
        </div>

        {/* PDPA */}
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input name="pdpa" type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-2 border-white/20 accent-yellow shrink-0" />
          <span className="text-[11px] text-white/40 leading-snug">
            I agree to the{' '}
            <Link href="/profile/faq#privacy" className="underline text-white/60 font-semibold">Privacy Policy</Link>
            . Email, phone &amp; gender collected for pickleball sessions only. (PDPA, Singapore)
          </span>
        </label>

        {error && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full h-[52px] border-2 border-black bg-brand text-white rounded-[16px] font-heading font-extrabold italic text-[22px] uppercase shadow-[4px_4px_0_#111] disabled:opacity-50 transition-opacity"
        >
          {pending ? 'Creating account…' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <p className="text-center text-sm text-white/40">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-yellow">Log in</Link>
      </p>
    </div>
  )
}
