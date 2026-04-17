'use client'

import { useEffect, useRef } from 'react'

/**
 * ScrollCompass — fixed right-side compass whose needle rotates
 * smoothly from north (top of page) to south-west (bottom of page)
 * as the user scrolls, mirroring the app's guidance metaphor.
 *
 * Visible on xl+ screens only. Zero interaction, purely ambient.
 */
export default function ScrollCompass() {
  const needleRef = useRef<SVGGElement>(null)
  const dotsRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop  = window.scrollY
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight
      const progress   = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0

      // Sweep needle: 0% → -20°  ·  100% → 340°  (full rotation)
      if (needleRef.current) {
        const deg = -20 + progress * 360
        needleRef.current.style.transform = `rotate(${deg}deg)`
      }

      // Highlight the active progress dot
      if (dotsRef.current) {
        const dots = dotsRef.current.querySelectorAll<HTMLSpanElement>('span')
        const active = Math.floor(progress * (dots.length - 0.01))
        dots.forEach((d, i) => {
          d.style.opacity    = i === active ? '1'   : '0.25'
          d.style.background = i === active ? '#3DD6B0' : 'rgba(61,214,176,0.4)'
          d.style.transform  = i === active ? 'scaleX(2.2)' : 'scaleX(1)'
        })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()   // initialise immediately

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-3 pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* ── Compass dial ───────────────────────── */}
      <div className="relative w-[72px] h-[72px]">

        {/* Outermost dashed ring — slow spin */}
        <svg
          viewBox="0 0 72 72"
          className="compass-ring-outer absolute inset-0 w-full h-full"
        >
          <circle
            cx="36" cy="36" r="33"
            stroke="rgba(61,214,176,0.14)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="3 7"
          />
        </svg>

        {/* Second ring — counter-spin */}
        <svg
          viewBox="0 0 72 72"
          className="compass-ring-inner absolute inset-0 w-full h-full"
        >
          <circle
            cx="36" cy="36" r="27"
            stroke="rgba(61,214,176,0.08)"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="2 9"
          />
        </svg>

        {/* Static face */}
        <svg viewBox="0 0 72 72" className="absolute inset-0 w-full h-full">
          {/* Main ring */}
          <circle
            cx="36" cy="36" r="31"
            stroke="rgba(61,214,176,0.22)"
            strokeWidth="1.2"
            fill="rgba(7,15,21,0.85)"
          />
          {/* Inner reference ring */}
          <circle
            cx="36" cy="36" r="22"
            stroke="rgba(61,214,176,0.09)"
            strokeWidth="0.7"
            fill="none"
          />

          {/* Cardinal tick marks */}
          {[0, 90, 180, 270].map((deg) => {
            const rad  = (deg * Math.PI) / 180
            const x1   = 36 + 28 * Math.sin(rad)
            const y1   = 36 - 28 * Math.cos(rad)
            const x2   = 36 + 31 * Math.sin(rad)
            const y2   = 36 - 31 * Math.cos(rad)
            return (
              <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(61,214,176,0.45)" strokeWidth="1.4" strokeLinecap="round" />
            )
          })}
          {/* Intermediate ticks */}
          {[45, 135, 225, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180
            const x1  = 36 + 29 * Math.sin(rad)
            const y1  = 36 - 29 * Math.cos(rad)
            const x2  = 36 + 31 * Math.sin(rad)
            const y2  = 36 - 31 * Math.cos(rad)
            return (
              <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(61,214,176,0.20)" strokeWidth="0.8" strokeLinecap="round" />
            )
          })}

          {/* Needle — group rotates via JS */}
          <g ref={needleRef} style={{ transformOrigin: '36px 36px', transition: 'transform 0.1s ease-out' }}>
            {/* North — teal */}
            <path d="M36 36 L33.5 14 L36 19.5 L38.5 14 Z" fill="#3DD6B0" />
            {/* South — muted */}
            <path d="M36 36 L34 58 L36 52.5 L38 58 Z" fill="rgba(61,214,176,0.28)" />
          </g>

          {/* Centre dot */}
          <circle cx="36" cy="36" r="3" fill="#3DD6B0" />
          <circle cx="36" cy="36" r="1.5" fill="#070F15" />
        </svg>
      </div>

      {/* ── Scroll progress dots ────────────────── */}
      <div ref={dotsRef} className="flex flex-col items-center gap-[5px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            style={{
              display: 'block',
              width: '6px',
              height: '3px',
              borderRadius: '999px',
              background: i === 0 ? '#3DD6B0' : 'rgba(61,214,176,0.4)',
              opacity: i === 0 ? 1 : 0.25,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
