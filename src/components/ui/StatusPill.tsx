import type { ReactNode } from 'react'

type Variant = 'live' | 'playing' | 'success' | 'danger' | 'muted' | 'outline' | 'yellow'

const VARIANTS: Record<Variant, string> = {
  live:    'bg-brand text-white',
  playing: 'bg-brand text-white',
  success: 'bg-success-bg text-success-text',
  danger:  'bg-danger-bg text-danger-text',
  muted:   'bg-muted text-body',
  outline: 'border border-black text-black',
  yellow:  'bg-yellow text-black',
}

interface Props {
  label?: string
  children?: React.ReactNode
  variant?: Variant
  dot?: boolean
  className?: string
}

export function StatusPill({ label, children, variant = 'muted', dot = false, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold shrink-0 ${VARIANTS[variant]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children ?? label}
    </span>
  )
}
