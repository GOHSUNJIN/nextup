'use client'

import { useEffect } from 'react'

export function DebugLog({ data }: { data: Record<string, unknown> }) {
  useEffect(() => {
    for (const [key, value] of Object.entries(data)) {
      console.log(`[profile] ${key}:`, value)
    }
  }, [data])
  return null
}
