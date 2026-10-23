'use client'

import { type ReactNode, useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white border-t-2 border-black rounded-t-[24px] p-5 flex flex-col gap-4 max-h-[85dvh] overflow-y-auto">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-muted" />
        {title && (
          <h2 className="font-heading font-extrabold italic text-2xl uppercase pt-2">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
