'use client'
import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [phase, setPhase] = useState<'hidden' | 'visible' | 'fading'>('hidden')

  useEffect(() => {
    if (sessionStorage.getItem('splash_shown')) return
    sessionStorage.setItem('splash_shown', '1')

    setPhase('visible')
    const t1 = setTimeout(() => setPhase('fading'), 1500)
    const t2 = setTimeout(() => setPhase('hidden'), 2100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'hidden') return null

  return (
    <div
      className={`absolute inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden transition-opacity duration-[600ms] ${phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Yellow burst accents */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-yellow rounded-full opacity-15" />
      <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-yellow rounded-full opacity-10" />

      <div className="relative flex flex-col items-center gap-2">
        <p className="font-heading font-extrabold italic leading-none" style={{ fontSize: '5.5rem' }}>
          <span className="text-white">NEXT</span>
          <span className="text-yellow">UP</span>
        </p>
        <p className="text-[#BDB9AF] text-xs tracking-[0.25em] uppercase">by Picklepedia</p>
      </div>
    </div>
  )
}
