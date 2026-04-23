'use client'

import { useEffect, useRef } from 'react'

/**
 * ScrollCompass — floating bottom-right journey indicator.
 *
 * CONTAINER
 *   Pure circle — no rectangular card, no pill, no label.
 *   Circular frosted-glass background, soft radial teal glow,
 *   no hard rectangular border or box that reads as a widget.
 *   44 px on mobile (scaled down, stays out of the way),
 *   62 px on sm+ (25–30 % larger than the old 48 px pill interior).
 *
 * NEEDLE LOGIC  — unchanged
 *   Section-aware N→E→S→W mapping with ease-in-out interpolation.
 *   Waypoints: [scrollProgress 0–1, needleDegrees]
 */

const WAYPOINTS: [number, number][] = [
  [0.00,   0],  // Hero                → North
  [0.12,  30],  // Core Philosophy     → NNE
  [0.24,  90],  // Architecture        → East
  [0.38, 120],  // Modules             → ESE
  [0.50, 160],  // Polaris intelligence → SSE
  [0.63, 180],  // Smart Features      → South
  [0.74, 210],  // Security & Privacy  → SSW
  [0.85, 240],  // Why PolarisPilot    → SW
  [1.00, 270],  // Team / CTA / Footer → West
]

function progressToDeg(p: number): number {
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const [p0, d0] = WAYPOINTS[i]
    const [p1, d1] = WAYPOINTS[i + 1]
    if (p >= p0 && p <= p1) {
      const t     = (p - p0) / (p1 - p0)
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      return d0 + eased * (d1 - d0)
    }
  }
  return WAYPOINTS[WAYPOINTS.length - 1][1]
}

export default function ScrollCompass() {
  const needleRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress  = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0
      const deg       = progressToDeg(progress)
      if (needleRef.current) {
        needleRef.current.style.transform = `rotate(${deg}deg)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Soft ambient radial bloom behind the circle — blends into the page */}
      <div
        className="absolute rounded-full"
        style={{
          inset:      '-18px',
          background: 'radial-gradient(circle, rgba(61,214,176,0.13) 0%, transparent 68%)',
        }}
      />

      {/* ── Circular frosted-glass container ────────────────────── */}
      <div
        className="relative w-[44px] h-[44px] sm:w-[62px] sm:h-[62px] rounded-full"
        style={{
          background:           'rgba(7,15,21,0.50)',
          backdropFilter:       'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border:               '1px solid rgba(61,214,176,0.14)',
          boxShadow: [
            '0 0 16px rgba(61,214,176,0.22)',
            '0 0 32px rgba(61,214,176,0.09)',
            '0 4px 20px rgba(0,0,0,0.44)',
          ].join(', '),
        }}
      >
        {/* Two staggered ripple rings */}
        <div className="compass-pulse-ring compass-pulse-1" />
        <div className="compass-pulse-ring compass-pulse-2" />

        {/* Spinning outer dashed ring */}
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
              'drop-shadow(0 0 6px rgba(61,214,176,0.38)) drop-shadow(0 0 14px rgba(61,214,176,0.14))',
          }}
        >
          {/* Glow halo */}
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

          {/* Needle — section-aware ease-in-out rotation (logic unchanged) */}
          <g
            ref={needleRef}
            style={{
              transformOrigin: '24px 24px',
              transition:      'transform 0.55s cubic-bezier(0.45, 0, 0.55, 1)',
            }}
          >
            <path d="M24 24 L22.2 9 L24 13.5 L25.8 9 Z"       fill="#3DD6B0"/>
            <path d="M24 24 L23.1 9.5 L24 11.5 L24.9 9.5 Z"   fill="rgba(255,255,255,0.22)"/>
            <path d="M24 24 L22.8 39 L24 35 L25.2 39 Z"        fill="rgba(61,214,176,0.20)"/>
          </g>

          {/* Centre jewel */}
          <circle cx="24" cy="24" r="2.8" fill="#3DD6B0" opacity="0.90"/>
          <circle cx="24" cy="24" r="1.5" fill="rgba(7,15,21,0.95)"/>
          <circle cx="24" cy="24" r="0.8" fill="rgba(61,214,176,0.80)"/>
        </svg>
      </div>
    </div>
  )
}
