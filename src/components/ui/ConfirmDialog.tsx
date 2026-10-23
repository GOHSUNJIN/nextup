'use client'

import { type ReactNode } from 'react'

interface Props {
  open?: boolean
  title: string
  body: string | ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open = true, title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  danger = false, onConfirm, onCancel
}: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40">
      <div className="w-full max-w-sm bg-white border-2 border-black rounded-[18px] shadow-hard overflow-hidden">
        <div className="p-5 flex flex-col gap-3">
          <h2 className="font-heading font-extrabold italic text-2xl uppercase">{title}</h2>
          <div className="text-sm text-body leading-relaxed">{body}</div>
        </div>
        <div className="flex border-t-2 border-black">
          <button
            onClick={onCancel}
            className="flex-1 h-[52px] text-sm font-bold border-r-2 border-black hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-[52px] font-heading font-extrabold italic text-xl uppercase ${danger ? 'bg-brand text-white' : 'bg-black text-white'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
