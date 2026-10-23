'use client'

import { useEffect, useState } from 'react'

interface Props {
  deadline: string | Date  // ISO string or Date
  onExpire?: () => void
  className?: string
}

export function CountdownTimer({ deadline, onExpire, className = '' }: Props) {
  const [secs, setSecs] = useState(() => getSecsLeft(deadline))

  useEffect(() => {
    setSecs(getSecsLeft(deadline))
    const id = setInterval(() => {
      const s = getSecsLeft(deadline)
      setSecs(s)
      if (s <= 0) {
        clearInterval(id)
        onExpire?.()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [deadline, onExpire])

  if (secs <= 0) return <span className={className}>0:00</span>

  const m = Math.floor(secs / 60)
  const s = secs % 60
  return (
    <span className={`font-heading font-extrabold italic tabular-nums ${className}`}>
      {m}:{String(s).padStart(2, '0')}
    </span>
  )
}

function getSecsLeft(deadline: string | Date) {
  return Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000))
}
