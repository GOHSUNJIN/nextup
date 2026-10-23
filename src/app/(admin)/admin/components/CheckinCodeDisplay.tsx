'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import QRCode from 'react-qr-code'

export function CheckinCodeDisplay({ sessionId }: { sessionId: string }) {
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const rotate = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('rotate_checkin_token', {
      p_session_id: sessionId,
    })
    if (error || !data) {
      setError('Failed to generate code')
      return
    }
    const result = data as { code?: string; expires_at?: string; error?: string }
    if (result.error) {
      setError(result.error)
      return
    }
    setCode(result.code ?? null)
    setExpiresAt(result.expires_at ?? null)
    setError(null)
  }, [sessionId])

  useEffect(() => {
    rotate()
    const id = setInterval(rotate, 60000)
    return () => clearInterval(id)
  }, [rotate])

  const checkinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/checkin?session=${sessionId}&code=${code}`
      : ''

  if (error) {
    return (
      <div className="bg-danger-bg border-2 border-black rounded-[18px] p-4 text-sm text-danger-text">
        {error}
      </div>
    )
  }

  if (!code) {
    return (
      <div className="bg-black rounded-[18px] p-6 text-center">
        <p className="text-[#BDB9AF] text-sm animate-pulse">Generating code…</p>
      </div>
    )
  }

  return (
    <div className="bg-black text-white rounded-[18px] p-5 flex flex-col items-center gap-4">
      {/* QR code */}
      <div className="bg-white p-3 rounded-[14px]">
        <QRCode value={checkinUrl} size={160} />
      </div>

      {/* 4-digit code */}
      <div className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-1">
          Or type this code
        </p>
        <p className="font-heading font-extrabold italic text-6xl text-yellow tracking-[0.15em]">
          {code}
        </p>
      </div>

      {/* Countdown to next rotation */}
      {expiresAt && (
        <div className="flex items-center gap-1.5 text-[#BDB9AF] text-xs">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Refreshes in{' '}
          <span className="font-bold text-white tabular-nums">
            <RefreshCountdown expiresAt={expiresAt} onExpire={rotate} />
          </span>
        </div>
      )}
    </div>
  )
}

function RefreshCountdown({
  expiresAt,
  onExpire,
}: {
  expiresAt: string
  onExpire: () => void
}) {
  const [secs, setSecs] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  )

  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      )
      setSecs(s)
      if (s <= 0) {
        clearInterval(id)
        onExpire()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpire])

  return <>{secs}s</>
}
