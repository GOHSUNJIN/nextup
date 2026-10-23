'use client'

import { Suspense } from 'react'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn, signInWithMagicLink } from '@/app/actions/auth'
import { BigActionButton } from '@/components/ui/BigActionButton'

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
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/courts" className="inline-flex w-9 h-9 rounded-full border-2 border-black items-center justify-center bg-white mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-heading font-extrabold italic text-4xl uppercase leading-tight">
          WELCOME BACK
        </h1>
        <p className="text-body text-sm mt-1">Sign in to join the queue.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-[14px] border-2 border-black">
        {(['password', 'magic'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); setMagicSent(false) }}
            className={`flex-1 h-10 rounded-[10px] text-sm font-bold transition-all ${
              mode === m
                ? 'bg-white border-2 border-black shadow-[2px_2px_0_#111111]'
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
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              placeholder="Your password"
              className="h-12 rounded-[12px] border-2 border-black bg-white px-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && (
            <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>
          )}

          <BigActionButton type="submit" disabled={pending} size="lg">
            {pending ? 'Signing in…' : 'SIGN IN'}
          </BigActionButton>
        </form>
      ) : magicSent ? (
        <div className="bg-success-bg border-2 border-black rounded-[18px] p-5 text-center flex flex-col gap-2">
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

          <BigActionButton type="submit" disabled={pending} size="lg">
            {pending ? 'Sending…' : 'SEND MAGIC LINK'}
          </BigActionButton>
        </form>
      )}

      <p className="text-center text-sm text-body">
        No account?{' '}
        <Link href="/signup" className="font-bold text-black underline">Create one</Link>
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
