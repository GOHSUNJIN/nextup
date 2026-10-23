'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center bg-white shrink-0"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  )
}
