'use client'

import { useEffect } from 'react'

type ToastVariant = 'success' | 'danger' | 'info'

const VARIANTS: Record<ToastVariant, string> = {
  success: 'bg-success-bg text-success-text border-success-text',
  danger:  'bg-danger-bg text-danger-text border-danger-text',
  info:    'bg-black text-white border-black',
}

interface ToastProps {
  message: string
  variant?: ToastVariant
  onDismiss: () => void
  duration?: number  // ms, 0 = no auto-dismiss
}

export function Toast({ message, variant = 'info', onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!duration) return
    const id = setTimeout(onDismiss, duration)
    return () => clearTimeout(id)
  }, [duration, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-4 right-4 z-50 flex items-center gap-3 rounded-[14px] border-2 px-4 py-3 shadow-lg text-sm font-semibold ${VARIANTS[variant]}`}
    >
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
  deadline: string | Date
}

export function UndoToast({ message, onUndo, onDismiss, deadline }: UndoToastProps) {
  useEffect(() => {
    const ms = new Date(deadline).getTime() - Date.now()
    if (ms <= 0) { onDismiss(); return }
    const id = setTimeout(onDismiss, ms)
    return () => clearTimeout(id)
  }, [deadline, onDismiss])

  return (
    <div
      role="status"
      className="fixed bottom-24 left-4 right-4 z-50 flex items-center gap-3 bg-black text-white rounded-[14px] border-2 border-black px-4 py-3 shadow-lg"
    >
      <span className="flex-1 text-sm font-semibold">{message}</span>
      <button
        onClick={onUndo}
        className="text-yellow text-sm font-extrabold uppercase shrink-0"
      >
        Undo
      </button>
    </div>
  )
}
