'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { resendVerification } from '@/app/actions/auth'

export default function VerifyEmailPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleResend() {
    setError(null)
    startTransition(async () => {
      const result = await resendVerification()
      if (result?.error) setError(result.error)
      else setSent(true)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[20px] px-5 pt-5 pb-8">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow rounded-full opacity-20" />
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow rounded-full opacity-40" />
        <div className="relative">
          <div className="w-12 h-12 rounded-[14px] bg-yellow border-2 border-black flex items-center justify-center shadow-[3px_3px_0_#111] mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">NextUp</p>
          <h1 className="font-heading font-extrabold italic text-5xl uppercase leading-none text-white">
            Check your<br /><span className="text-yellow">Email</span>
          </h1>
          <p className="text-[#BDB9AF] text-sm mt-3">We sent a confirmation link. Click it to activate your account.</p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white border-2 border-black rounded-[20px] shadow-[4px_4px_0_#333] p-5 flex flex-col gap-4">
        <div className="bg-muted rounded-[12px] border-2 border-black p-4">
          <p className="text-xs text-body leading-relaxed">
            <span className="font-bold text-black">Didn&apos;t get the email?</span>{' '}
            Check your spam folder. The link expires in 24 hours.
          </p>
        </div>

        {sent ? (
          <p className="text-sm text-success-text bg-success-bg border-2 border-black rounded-[12px] px-3 py-2.5 text-center font-semibold">
            Verification email resent!
          </p>
        ) : (
          <>
            {error && (
              <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={handleResend}
              className="w-full h-[56px] border-2 border-black bg-brand text-white rounded-[16px] font-heading font-extrabold italic text-[22px] uppercase shadow-[4px_4px_0_#111] disabled:opacity-50 transition-opacity"
            >
              {pending ? 'Sending…' : 'RESEND EMAIL'}
            </button>
          </>
        )}
      </div>

      <p className="text-center text-sm text-white/50">
        <Link href="/login" className="font-bold text-yellow">Back to login</Link>
      </p>
    </div>
  )
}
