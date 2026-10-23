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

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[20px] px-5 pt-5 pb-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow rounded-full opacity-20" />
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow rounded-full opacity-40" />
        <div className="relative">
          <Link
            href="/login"
            className="inline-flex w-9 h-9 rounded-full border-2 border-white/20 items-center justify-center mb-3 text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-1">NextUp</p>
          <h1 className="font-heading font-extrabold italic text-4xl uppercase leading-none text-white">
            Create<br /><span className="text-yellow">Account</span>
          </h1>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white border-2 border-black rounded-[20px] shadow-[4px_4px_0_#333] px-4 py-4 flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-body" htmlFor="name">Full name</label>
            <input
              id="name" name="name" type="text" required autoComplete="name"
              placeholder="Your name"
              className="h-11 rounded-[10px] border-2 border-black bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-body" htmlFor="phone">Phone number</label>
            <input
              id="phone" name="phone" type="tel" required autoComplete="tel"
              placeholder="+65 9123 4567"
              className="h-11 rounded-[10px] border-2 border-black bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-body" htmlFor="password">Password</label>
            <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} placeholder="Min. 8 characters" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-body">Gender <span className="font-normal">(used for Women &amp; Mixed courts)</span></label>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map(g => (
                <label key={g} className="flex-1">
                  <input type="radio" name="gender" value={g} required className="sr-only peer" />
                  <span className="flex h-11 items-center justify-center rounded-[10px] border-2 border-black bg-white text-sm font-bold capitalize cursor-pointer peer-checked:bg-black peer-checked:text-white transition-colors">
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input name="pdpa" type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-2 border-black accent-black shrink-0" />
            <span className="text-[11px] text-body leading-snug">
              I agree to the{' '}
              <Link href="/profile/faq#privacy" className="underline font-semibold text-black">Privacy Policy</Link>
              . Phone &amp; gender collected for pickleball sessions only. (PDPA, Singapore)
            </span>
          </label>

          {error && (
            <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-[52px] border-2 border-black bg-brand text-white rounded-[14px] font-heading font-extrabold italic text-[22px] uppercase shadow-[4px_4px_0_#111] disabled:opacity-50 transition-opacity"
          >
            {pending ? 'Creating account…' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-yellow">Log in</Link>
      </p>
    </div>
  )
}
