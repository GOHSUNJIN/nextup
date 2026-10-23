'use client'
import { useState, useTransition } from 'react'
import { endSession, handleNoShows } from '@/app/actions/admin'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useRouter } from 'next/navigation'

export function EndSessionButton({ sessionId }: { sessionId: string }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleEnd() {
    startTransition(async () => {
      const result = await endSession(sessionId)
      if (result?.error) { setError(result.error); setShowConfirm(false) }
      else router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="h-9 px-3 border-2 border-danger-text bg-danger-bg text-danger-text rounded-full flex items-center text-xs font-bold gap-1.5"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
        End session
      </button>
      {error && <p className="text-xs text-danger-text mt-1">{error}</p>}
      <ConfirmDialog
        open={showConfirm}
        title="End session?"
        body="All active queue entries will be closed. Players will be notified. This cannot be undone."
        confirmLabel={pending ? 'Ending…' : 'End session'}
        danger
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleEnd}
      />
    </>
  )
}

export function HandleNoShowsButton({ sessionId }: { sessionId: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await handleNoShows(sessionId); router.refresh() })}
      className="h-9 px-3 border-2 border-black bg-white rounded-full flex items-center text-xs font-bold gap-1.5 disabled:opacity-50"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
      {pending ? 'Checking…' : 'Handle no-shows'}
    </button>
  )
}
