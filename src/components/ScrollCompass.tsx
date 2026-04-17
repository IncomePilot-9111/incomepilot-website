'use client'

import { useEffect, useRef } from 'react'

/**
 * ScrollCompass — floating bottom-right journey indicator.
 *
 * PLACEMENT
 *   Fixed bottom-right corner. pointer-events-none — not a button.
 *   Hidden on mobile (<640 px), visible on sm+ so it never crowds small screens.
 *
 * NEEDLE LOGIC
 *   The needle maps scroll progress to cardinal directions — not a raw spin:
 *     North  (0°)   = Hero / top of page
 *     East   (90°)  = Architecture / Modules
 *     South  (180°) = Features / Security
 *     West   (270°) = Team / Footer
 *   Transitions between waypoints are ease-in-out so the movement feels
 *   deliberate and intelligent rather than mechanical or random.
 *
 * VISUAL
 *   Glass pill with one dashed spinning ring, teal glow, 9 horizontal
 *   progress dashes, and a muted "CompassInsights" label. Intentionally
 *   subdued so it reads as a navigation signal, not a primary CTA.
 */

// Waypoints: [scrollProgress 0–1, needleDegrees]
// Mapped across the 11 page sections (Hero → CTA)
const WAYPOINTS: [number, number][] = [
  [0.00,   0],  // Hero                → North
  [0.12,  30],  // Core Philosophy     → NNE
  [0.24,  90],  // Architecture        → East
  [0.38, 120],  // Modules             → ESE
  [0.50, 160],  // CompassInsights     → SSE
  [0.63, 180],  // Smart Features      → South
  [0.74, 210],  // Security & Privacy  → SSW
  [0.85, 240],  // Why IncomePilot     → SW
  [1.00, 270],  // Team / CTA / Footer → West
]

/** Linear-interpolate with ease-in-out between section waypoints */
function progressToDeg(p: number): number {
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const [p0, d0] = WAYPOINTS[i]
    const [p1, d1] = WAYPOINTS[i + 1]
    if (p >= p0 && p <= p1) {
      const t      = (p - p0) / (p1 - p0)
      const eased  = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t  // ease-in-out
      return d0 + eased * (d1 - d0)
    }
  }
  return WAYPOINTS[WAYPOINTS.length - 1][1]
}

export default function ScrollCompass() {
  const needleRef = useRef<SVGGElement>(null)
  const dotsRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress  = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0
      const deg       = progressToDeg(progress)

      if (needleRef.current) {
        needleRef.current.style.transform = `rotate(${deg}deg)`
      }

      if (dotsRef.current) {
        const segs   = dotsRef.current.querySelectorAll<HTMLSpanElement>('span')
        const total  = segs.length
        const active = Math.min(Math.floor(progress * total), total - 1)
        segs.forEach((s, i) => {
          const isActive = i === active
          const isPast   = i < active
          s.style.opacity    = isActive ? '1' : isPast ? '0.50' : '0.20'
          s.style.background = isActive
            ? '#3DD6B0'
            : isPast ? 'rgba(61,214,176,0.45)' : 'rgba(61,214,176,0.18)'
          s.style.transform  = isActive ? 'scaleY(1.6) scaleX(1.2)' : 'scaleY(1) scaleX(1)'
          s.style.boxShadow  = isActive ? '0 0 5px rgba(61,214,176,0.6)' : 'none'
        })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed bottom-6 right-6 z-40 hidden sm:flex pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Subtle bottom-right ambient glow — doesn't radiate forward like a CTA */}
      <div
        className="absolute inset-[-16px] rounded-3xl"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 80% 100%, rgba(61,214,176,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Glass pill ─────────────────────────────────────── */}
      <div
        className="relative flex items-center gap-3.5 px-4 py-3 rounded-2xl"
        style={{
          background:           'rgba(7,15,21,0.80)',
          backdropFilter:       'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border:               '1px solid rgba(61,214,176,0.16)',
          boxShadow: [
            '0 8px 32px rgba(0,0,0,0.50)',
            '0 0 0 1px rgba(61,214,176,0.05)',
            'inset 0 1px 0 rgba(61,214,176,0.09)',
          ].join(', '),
        }}
      >

        {/* ── Compass dial — 48 px, intentionally not oversized ─ */}
        <div className="relative w-[48px] h-[48px] flex-shrink-0">

          {/* Two staggered ripple rings — calm, not aggressive */}
          <div className="compass-pulse-ring compass-pulse-1" />
          <div className="compass-pulse-ring compass-pulse-2" />

          {/* Single outer spinning dashed ring */}
          <svg
            viewBox="0 0 48 48"
            className="compass-ring-outer absolute inset-0 w-full h-full"
          >
            <circle
              cx="24" cy="24" r="22"
              stroke="rgba(61,214,176,0.18)" strokeWidth="1"
              fill="none" strokeDasharray="3 5"
            />
          </svg>

          {/* Compass face */}
          <svg
            viewBox="0 0 48 48"
            className="absolute inset-0 w-full h-full"
            style={{
              filter:
                'drop-shadow(0 0 6px rgba(61,214,176,0.40)) drop-shadow(0 0 14px rgba(61,214,176,0.16))',
            }}
          >
            {/* Soft glow halo */}
            <circle cx="24" cy="24" r="21" stroke="rgba(61,214,176,0.06)" strokeWidth="5" fill="none"/>
            {/* Bezel */}
            <circle cx="24" cy="24" r="20" stroke="rgba(61,214,176,0.26)" strokeWidth="1.2" fill="rgba(7,15,21,0.93)"/>
            {/* Inner reference ring */}
            <circle cx="24" cy="24" r="13" stroke="rgba(61,214,176,0.08)" strokeWidth="0.6" fill="none"/>

            {/* Cardinal ticks */}
            {[0, 90, 180, 270].map((d) => {
              const r  = (d * Math.PI) / 180
              const x1 = 24 + 17 * Math.sin(r), y1 = 24 - 17 * Math.cos(r)
              const x2 = 24 + 20 * Math.sin(r), y2 = 24 - 20 * Math.cos(r)
              return (
                <line key={d} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(61,214,176,0.55)" strokeWidth="1.4" strokeLinecap="round"/>
              )
            })}
            {/* Diagonal ticks */}
            {[45, 135, 225, 315].map((d) => {
              const r  = (d * Math.PI) / 180
              const x1 = 24 + 18.5 * Math.sin(r), y1 = 24 - 18.5 * Math.cos(r)
              const x2 = 24 + 20   * Math.sin(r), y2 = 24 - 20   * Math.cos(r)
              return (
                <line key={d} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(61,214,176,0.20)" strokeWidth="0.7" strokeLinecap="round"/>
              )
            })}

            {/* Needle — ease-in-out section-aware rotation */}
            <g
              ref={needleRef}
              style={{
                transformOrigin: '24px 24px',
                transition: 'transform 0.55s cubic-bezier(0.45, 0, 0.55, 1)',
              }}
            >
              {/* North tip — teal */}
              <path d="M24 24 L22.2 9 L24 13.5 L25.8 9 Z" fill="#3DD6B0"/>
              {/* Highlight */}
              <path d="M24 24 L23.1 9.5 L24 11.5 L24.9 9.5 Z" fill="rgba(255,255,255,0.22)"/>
              {/* South tip — muted */}
              <path d="M24 24 L22.8 39 L24 35 L25.2 39 Z" fill="rgba(61,214,176,0.20)"/>
            </g>

            {/* Centre jewel */}
            <circle cx="24" cy="24" r="2.8" fill="#3DD6B0" opacity="0.90"/>
            <circle cx="24" cy="24" r="1.5" fill="rgba(7,15,21,0.95)"/>
            <circle cx="24" cy="24" r="0.8" fill="rgba(61,214,176,0.80)"/>
          </svg>
        </div>

        {/* ── Vertical divider ──────────────────────────────── */}
        <div
          style={{
            width: '1px', height: '28px', flexShrink: 0,
            background: 'rgba(61,214,176,0.12)',
          }}
        />

        {/* ── Progress dashes + label ───────────────────────── */}
        <div className="flex flex-col gap-[6px]">

          {/* 9 horizontal dashes */}
          <div ref={dotsRef} className="flex items-center gap-[4px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                style={{
                  display:      'block',
                  width:        '12px',
                  height:       '2px',
                  borderRadius: '999px',
                  background:   i === 0 ? '#3DD6B0' : 'rgba(61,214,176,0.18)',
                  opacity:      i === 0 ? 1 : 0.20,
                  transition:   'all 0.35s ease',
                }}
              />
            ))}
          </div>

          {/* Brand label — muted, not a headline */}
          <span
            style={{
              fontSize:      '6.5px',
              letterSpacing: '0.15em',
              fontWeight:    700,
              color:         'rgba(61,214,176,0.36)',
              textTransform: 'uppercase',
            }}
          >
            CompassInsights
          </span>
        </div>

      </div>
    </div>
  )
}
