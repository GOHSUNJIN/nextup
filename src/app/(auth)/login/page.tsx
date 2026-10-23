'use client'

import { Suspense } from 'react'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn, signInWithMagicLink } from '@/app/actions/auth'
import { PasswordInput } from '@/components/ui/PasswordInput'

function LoginContent() {
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [pending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/courts'

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('next', next)
    startTransition(async () => {
      const result = await signIn(fd)
      if (result?.error) setError(result.error)
    })
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signInWithMagicLink(fd)
      if (result?.error) setError(result.error)
      else setMagicSent(true)
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
          <p className="text-[#BDB9AF] text-sm mt-3">Sign in to join the queue.</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white border-2 border-black rounded-[20px] shadow-[4px_4px_0_#333] p-5 flex flex-col gap-4">
        {/* Mode toggle */}
        <div className="flex gap-1.5 p-1 bg-muted rounded-[12px] border-2 border-black">
          {(['password', 'magic'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(null); setMagicSent(false) }}
              className={`flex-1 h-9 rounded-[8px] text-sm font-bold transition-all ${
                mode === m
                  ? 'bg-white border-2 border-black shadow-[2px_2px_0_#111]'
                  : 'text-body'
              }`}
            >
              {m === 'password' ? 'Password' : 'Magic link'}
            </button>
          ))}
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email" required autoComplete="email"
                placeholder="you@example.com"
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
        ) : magicSent ? (
          <div className="bg-success-bg border-2 border-black rounded-[14px] p-5 text-center flex flex-col gap-2">
            <p className="font-bold text-success-text">Check your inbox!</p>
            <p className="text-sm text-body">We sent a magic link to your email. Click it to sign in — no password needed.</p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" htmlFor="magic-email">Email</label>
              <input
                id="magic-email" name="email" type="email" required autoComplete="email"
                placeholder="you@example.com"
                className="h-12 rounded-[12px] border-2 border-black bg-white px-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            {error && (
              <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full h-[56px] border-2 border-black bg-brand text-white rounded-[16px] font-heading font-extrabold italic text-[22px] uppercase shadow-[4px_4px_0_#111] disabled:opacity-50 transition-opacity"
            >
              {pending ? 'Sending…' : 'SEND MAGIC LINK'}
            </button>
          </form>
        )}
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
