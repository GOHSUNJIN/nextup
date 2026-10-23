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
      <div className="relative overflow-hidden rounded-[20px] px-5 pt-5 pb-8">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow rounded-full opacity-20" />
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow rounded-full opacity-40" />
        <div className="relative">
          <Link
            href="/login"
            className="inline-flex w-9 h-9 rounded-full border-2 border-white/20 items-center justify-center mb-4 text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">NextUp</p>
          <h1 className="font-heading font-extrabold italic text-5xl uppercase leading-none text-white">
            Create<br /><span className="text-yellow">Account</span>
          </h1>
          <p className="text-[#BDB9AF] text-sm mt-3">Join the queue, find partners, get notified.</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white border-2 border-black rounded-[20px] shadow-[4px_4px_0_#333] p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" htmlFor="name">Full name</label>
            <input
              id="name" name="name" type="text" required autoComplete="name"
              placeholder="Your name"
              className="h-12 rounded-[12px] border-2 border-black bg-white px-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              placeholder="you@example.com"
              className="h-12 rounded-[12px] border-2 border-black bg-white px-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" htmlFor="phone">
              Phone <span className="text-body font-normal">(optional)</span>
            </label>
            <input
              id="phone" name="phone" type="tel" autoComplete="tel"
              placeholder="+65 9123 4567"
              className="h-12 rounded-[12px] border-2 border-black bg-white px-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" htmlFor="password">Password</label>
            <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} placeholder="Min. 8 characters" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">
              Gender <span className="text-body font-normal text-xs">(used for Women &amp; Mixed courts only)</span>
            </label>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map(g => (
                <label key={g} className="flex-1">
                  <input type="radio" name="gender" value={g} required className="sr-only peer" />
                  <span className="flex h-12 items-center justify-center rounded-[12px] border-2 border-black bg-white text-sm font-bold capitalize cursor-pointer peer-checked:bg-black peer-checked:text-white transition-colors">
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input name="pdpa" type="checkbox" required className="mt-0.5 w-5 h-5 rounded border-2 border-black accent-black shrink-0" />
            <span className="text-xs text-body leading-relaxed">
              I agree to the{' '}
              <Link href="/profile/faq#privacy" className="underline font-semibold text-black">Privacy Policy</Link>
              . My email, phone and gender are collected to run pickleball sessions and are not shared with third parties. (PDPA, Singapore)
            </span>
          </label>

          {error && (
            <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-[56px] border-2 border-black bg-brand text-white rounded-[16px] font-heading font-extrabold italic text-[22px] uppercase shadow-[4px_4px_0_#111] disabled:opacity-50 transition-opacity"
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
