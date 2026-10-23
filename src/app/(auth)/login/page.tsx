'use client'

import { Suspense } from 'react'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from '@/app/actions/auth'
import { PasswordInput } from '@/components/ui/PasswordInput'

function LoginContent() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/courts'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('next', next)
    startTransition(async () => {
      const result = await signIn(fd)
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
            href="/courts"
            className="inline-flex w-9 h-9 rounded-full border-2 border-white/20 items-center justify-center mb-4 text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">NextUp</p>
          <h1 className="font-heading font-extrabold italic text-5xl uppercase leading-none text-white">
            Welcome<br /><span className="text-yellow">Back</span>
          </h1>
          <p className="text-[#BDB9AF] text-sm mt-3">Sign in with your phone number.</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white border-2 border-black rounded-[20px] shadow-[4px_4px_0_#333] p-5 flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" htmlFor="phone">Phone number</label>
            <input
              id="phone" name="phone" type="tel" required autoComplete="tel"
              placeholder="+65 9123 4567"
              className="h-12 rounded-[12px] border-2 border-black bg-white px-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" htmlFor="password">Password</label>
            <PasswordInput id="password" name="password" autoComplete="current-password" placeholder="Your password" />
          </div>

          {error && (
            <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-[56px] border-2 border-black bg-brand text-white rounded-[16px] font-heading font-extrabold italic text-[22px] uppercase shadow-[4px_4px_0_#111] disabled:opacity-50 transition-opacity"
          >
            {pending ? 'Signing in…' : 'SIGN IN'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-white/50">
        No account?{' '}
        <Link href="/signup" className="font-bold text-yellow">Create one</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
