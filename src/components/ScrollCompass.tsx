'use client'

import { useEffect, useRef } from 'react'

/**
 * ScrollCompass — premium fixed right-side scroll-progress indicator.
 *
 * • Glass-morphism pill housing with teal border glow
 * • 3 staggered CSS ripple rings radiating from the dial
 * • Needle rotates 0 → 360° as the user scrolls top → bottom
 * • 7 segmented progress dashes below the dial
 * • Visible on md+ screens (768 px and above)
 */
export default function ScrollCompass() {
  const needleRef = useRef<SVGGElement>(null)
  const dotsRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress  = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0

      // Needle: sweeps −15° (top) → 345° (bottom)
      if (needleRef.current) {
        const deg = -15 + progress * 360
        needleRef.current.style.transform = `rotate(${deg}deg)`
      }

      // Progress segments
      if (dotsRef.current) {
        const segs  = dotsRef.current.querySelectorAll<HTMLSpanElement>('span')
        const total = segs.length
        const active = Math.min(Math.floor(progress * total), total - 1)
        segs.forEach((s, i) => {
          const isActive = i === active
          s.style.opacity    = isActive ? '1' : '0.28'
          s.style.background = isActive ? '#3DD6B0' : 'rgba(61,214,176,0.35)'
          s.style.transform  = isActive ? 'scaleX(2.4)' : 'scaleX(1)'
        })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* ── Glass housing pill ───────────────────────────────── */}
      <div
        className="flex flex-col items-center gap-3 px-3 py-4 rounded-2xl"
        style={{
          background:       'rgba(7,15,21,0.78)',
          backdropFilter:   'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border:           '1px solid rgba(61,214,176,0.18)',
          boxShadow:        '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(61,214,176,0.06), inset 0 1px 0 rgba(61,214,176,0.09)',
        }}
      >

        {/* ── Compass dial + ripple rings ──────────────────── */}
        <div className="relative w-[80px] h-[80px]">

          {/* Ripple rings (pure CSS, behind everything) */}
          <div className="compass-pulse-ring compass-pulse-1" />
          <div className="compass-pulse-ring compass-pulse-2" />
          <div className="compass-pulse-ring compass-pulse-3" />

          {/* Outer spinning dashed ring */}
          <svg
            viewBox="0 0 80 80"
            className="compass-ring-outer absolute inset-0 w-full h-full"
          >
            <circle
              cx="40" cy="40" r="37"
              stroke="rgba(61,214,176,0.20)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="3 6"
            />
          </svg>

          {/* Inner counter-spinning dashed ring */}
          <svg
            viewBox="0 0 80 80"
            className="compass-ring-inner absolute inset-0 w-full h-full"
          >
            <circle
              cx="40" cy="40" r="30"
              stroke="rgba(61,214,176,0.10)"
              strokeWidth="0.8"
              fill="none"
              strokeDasharray="2 8"
            />
          </svg>

          {/* Main compass face — with drop-shadow glow */}
          <svg
            viewBox="0 0 80 80"
            className="absolute inset-0 w-full h-full"
            style={{ filter: 'drop-shadow(0 0 8px rgba(61,214,176,0.45)) drop-shadow(0 0 16px rgba(61,214,176,0.20))' }}
          >
            {/* Soft glow halo ring */}
            <circle cx="40" cy="40" r="35" stroke="rgba(61,214,176,0.08)" strokeWidth="8" fill="none"/>
            {/* Main bezel */}
            <circle cx="40" cy="40" r="34" stroke="rgba(61,214,176,0.28)" strokeWidth="1.4" fill="rgba(7,15,21,0.92)"/>
            {/* Inner reference circle */}
            <circle cx="40" cy="40" r="24" stroke="rgba(61,214,176,0.10)" strokeWidth="0.7" fill="none"/>

            {/* Cardinal ticks — N/E/S/W */}
            {[0, 90, 180, 270].map((deg) => {
              const r   = (deg * Math.PI) / 180
              const x1  = 40 + 31 * Math.sin(r); const y1 = 40 - 31 * Math.cos(r)
              const x2  = 40 + 34 * Math.sin(r); const y2 = 40 - 34 * Math.cos(r)
              return (
                <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(61,214,176,0.60)" strokeWidth="1.6" strokeLinecap="round"/>
              )
            })}

            {/* Diagonal ticks */}
            {[45, 135, 225, 315].map((deg) => {
              const r   = (deg * Math.PI) / 180
              const x1  = 40 + 32 * Math.sin(r); const y1 = 40 - 32 * Math.cos(r)
              const x2  = 40 + 34 * Math.sin(r); const y2 = 40 - 34 * Math.cos(r)
              return (
                <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(61,214,176,0.25)" strokeWidth="0.9" strokeLinecap="round"/>
              )
            })}

            {/* Needle group — JS-driven rotation */}
            <g
              ref={needleRef}
              style={{ transformOrigin: '40px 40px', transition: 'transform 0.12s ease-out' }}
            >
              {/* North tip — bright teal, tapered diamond */}
              <path d="M40 40 L37.5 17 L40 23 L42.5 17 Z" fill="#3DD6B0"/>
              {/* Highlight on north tip */}
              <path d="M40 40 L39 19 L40 21 L41 19 Z" fill="rgba(255,255,255,0.28)"/>
              {/* South tip — muted */}
              <path d="M40 40 L38.5 63 L40 57 L41.5 63 Z" fill="rgba(61,214,176,0.22)"/>
            </g>

            {/* Centre jewel */}
            <circle cx="40" cy="40" r="4"   fill="#3DD6B0" opacity="0.92"/>
            <circle cx="40" cy="40" r="2.2" fill="rgba(7,15,21,0.95)"/>
            <circle cx="40" cy="40" r="1.1" fill="rgba(61,214,176,0.85)"/>
          </svg>
        </div>

        {/* ── Progress segments ────────────────────────────── */}
        <div ref={dotsRef} className="flex flex-col items-center gap-[5px]">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              style={{
                display:      'block',
                width:        '18px',
                height:       '2.5px',
                borderRadius: '999px',
                background:   i === 0 ? '#3DD6B0' : 'rgba(61,214,176,0.35)',
                opacity:      i === 0 ? 1 : 0.28,
                transition:   'all 0.35s ease',
              }}
            />
          ))}
        </div>

        {/* ── Label ───────────────────────────────────────── */}
        <span
          style={{
            fontSize:      '7.5px',
            letterSpacing: '0.14em',
            color:         'rgba(61,214,176,0.45)',
            textTransform: 'uppercase',
            fontWeight:    700,
          }}
        >
          SCROLL
        </span>

      </div>
    </div>
  )
}
