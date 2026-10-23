'use client'
import { useEffect, useRef, useState } from 'react'

export function SplashScreen() {
  const [phase, setPhase] = useState<'hidden' | 'visible' | 'fading'>('hidden')
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem('splash_shown')) return
    sessionStorage.setItem('splash_shown', '1')

    setPhase('visible')

    const start = performance.now()
    const duration = 1600

    function tick(now: number) {
      const elapsed = now - start
      const pct = Math.min((elapsed / duration) * 100, 100)
      setProgress(pct)
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setPhase('fading'), 100)
        setTimeout(() => setPhase('hidden'), 700)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  if (phase === 'hidden') return null

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-500 ${phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: '#E3342F' }}
    >
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ marginTop: '-70px' }}>
        {/* Starburst + pickleball */}
        <svg viewBox="0 0 316 316" width="210" height="210" aria-hidden="true" style={{ overflow: 'visible' }}>
          {/* Shadow polygon */}
          <polygon
            points="150,0 170,34 201,9 209,48 246,35 240,74 280,75 261,110 298,124 268,150 298,176 261,190 280,225 240,226 246,265 209,252 201,291 170,266 150,300 130,266 99,291 91,252 54,265 60,226 20,225 39,190 2,176 32,150 2,124 39,110 20,75 60,74 54,35 91,48 99,9 130,34"
            transform="translate(8,8)"
            fill="#111111"
          />
          {/* Yellow burst */}
          <polygon
            points="150,0 170,34 201,9 209,48 246,35 240,74 280,75 261,110 298,124 268,150 298,176 261,190 280,225 240,226 246,265 209,252 201,291 170,266 150,300 130,266 99,291 91,252 54,265 60,226 20,225 39,190 2,176 32,150 2,124 39,110 20,75 60,74 54,35 91,48 99,9 130,34"
            fill="#FFC72C"
            stroke="#111111"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          {/* Pickleball */}
          <circle cx="150" cy="150" r="78" fill="#DCD7C8" />
          <circle cx="142.2" cy="142.2" r="67.1" fill="#FFFFFF" />
          <g fill="#111111">
            <circle cx="150" cy="150" r="10.9" />
            <circle cx="150" cy="114.1" r="9.4" />
            <circle cx="181.1" cy="132.1" r="9.4" />
            <circle cx="181.1" cy="167.9" r="9.4" />
            <circle cx="150" cy="185.9" r="9.4" />
            <circle cx="118.9" cy="167.9" r="9.4" />
            <circle cx="118.9" cy="132.1" r="9.4" />
            <ellipse cx="180.4" cy="97.3" rx="4.7" ry="7.8" transform="rotate(-60 180.4 97.3)" />
            <ellipse cx="210.8" cy="150" rx="4.7" ry="7.8" transform="rotate(0 210.8 150)" />
            <ellipse cx="180.4" cy="202.7" rx="4.7" ry="7.8" transform="rotate(60 180.4 202.7)" />
            <ellipse cx="119.6" cy="202.7" rx="4.7" ry="7.8" transform="rotate(120 119.6 202.7)" />
            <ellipse cx="89.2" cy="150" rx="4.7" ry="7.8" transform="rotate(180 89.2 150)" />
            <ellipse cx="119.6" cy="97.3" rx="4.7" ry="7.8" transform="rotate(240 119.6 97.3)" />
          </g>
          <circle cx="150" cy="150" r="78" fill="none" stroke="#111111" strokeWidth="7" />
        </svg>

        {/* Wordmark */}
        <div className="mt-8 flex flex-col items-center gap-0.5">
          <span
            style={{
              fontFamily: "'Luckiest Guy', sans-serif",
              fontSize: '80px',
              lineHeight: 0.9,
              letterSpacing: '1px',
              color: '#FFFFFF',
              WebkitTextStroke: '2.5px #111111',
              paintOrder: 'stroke fill',
              textShadow: '4px 4px 0 #111111',
            }}
          >
            NEXT<span style={{ color: '#FFC72C' }}>UP</span>
          </span>
        </div>
      </div>

      {/* Bottom: progress bar + logo */}
      <div className="absolute left-0 right-0 bottom-10 flex flex-col items-center gap-9">
        {/* Progress bar */}
        <div
          role="progressbar"
          aria-label="Loading"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          style={{
            position: 'relative',
            width: '140px',
            height: '12px',
            borderRadius: '999px',
            background: '#B8231E',
            border: '2px solid #111111',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              borderRadius: '999px',
              background: '#FFC72C',
            }}
          />
          {/* Ball on progress */}
          <svg
            viewBox="0 0 26 26"
            width="26"
            height="26"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `calc(${progress}% - 13px)`,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <circle cx="13" cy="13" r="11" fill="#DCD7C8" />
            <circle cx="11.9" cy="11.9" r="9.5" fill="#FFFFFF" />
            <g fill="#111111">
              <circle cx="13" cy="13" r="1.5" />
              <circle cx="13" cy="7.9" r="1.3" />
              <circle cx="17.4" cy="10.5" r="1.3" />
              <circle cx="17.4" cy="15.5" r="1.3" />
              <circle cx="13" cy="18.1" r="1.3" />
              <circle cx="8.6" cy="15.5" r="1.3" />
              <circle cx="8.6" cy="10.5" r="1.3" />
              <ellipse cx="17.3" cy="5.6" rx="0.7" ry="1.1" transform="rotate(-60 17.3 5.6)" />
              <ellipse cx="21.6" cy="13" rx="0.7" ry="1.1" transform="rotate(0 21.6 13)" />
              <ellipse cx="17.3" cy="20.4" rx="0.7" ry="1.1" transform="rotate(60 17.3 20.4)" />
              <ellipse cx="8.7" cy="20.4" rx="0.7" ry="1.1" transform="rotate(120 8.7 20.4)" />
              <ellipse cx="4.4" cy="13" rx="0.7" ry="1.1" transform="rotate(180 4.4 13)" />
              <ellipse cx="8.7" cy="5.6" rx="0.7" ry="1.1" transform="rotate(240 8.7 5.6)" />
            </g>
            <circle cx="13" cy="13" r="11" fill="none" stroke="#111111" strokeWidth="2" />
          </svg>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/picklepedia-logo.png"
          alt="Picklepedia"
          width={104}
          height={95}
          style={{ filter: 'drop-shadow(2px 2px 0 #111111)', display: 'block' }}
        />
      </div>
    </div>
  )
}
