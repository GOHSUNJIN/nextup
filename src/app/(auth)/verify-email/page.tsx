'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { resendVerification } from '@/app/actions/auth'
import { BigActionButton } from '@/components/ui/BigActionButton'

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
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-yellow border-2 border-black flex items-center justify-center shadow-hard">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>

      <div>
        <h1 className="font-heading font-extrabold italic text-4xl uppercase leading-tight">
          CHECK YOUR EMAIL
        </h1>
        <p className="text-body text-sm mt-2 max-w-xs mx-auto">
          We sent a confirmation link to your email address. Click it to activate your account.
        </p>
      </div>

      <div className="w-full bg-white border-2 border-black rounded-[18px] p-4 text-left">
        <p className="text-xs text-body leading-relaxed">
          <span className="font-bold text-black">Didn&apos;t get the email?</span>{' '}
          Check your spam folder. The link expires in 24 hours.
        </p>
      </div>

      {sent ? (
        <p className="text-sm text-success-text bg-success-bg border border-black rounded-xl px-3 py-2 w-full text-center">
          Verification email resent!
        </p>
      ) : (
        <>
          {error && (
            <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2 w-full">{error}</p>
          )}
          <BigActionButton
            type="button"
            variant="white"
            size="lg"
            disabled={pending}
            onClick={handleResend}
            className="w-full"
          >
            {pending ? 'Sending…' : 'RESEND EMAIL'}
          </BigActionButton>
        </>
      )}

      <Link href="/courts" className="text-sm text-body underline">
        Continue to app
      </Link>
    </div>
  )
}
