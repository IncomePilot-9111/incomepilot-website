'use client'

import { useEffect, useRef } from 'react'

/**
 * GlobalBackground — site-wide fixed radar/compass texture.
 *
 * Renders behind ALL pages via layout.tsx (z-[1]), content sits at z-[2].
 *
 * LAYERS (back → front)
 *   1. Concentric radar rings   — repeating-radial-gradient, very subtle
 *   2. Cardinal crosshatch lines — thin axis lines through the radar centre
 *   3. Grid crosshatch           — fine 48px tile, same accent as hero
 *   4. Radar sweep beam          — slow CSS-animated conic wedge (14 s)
 *   5. Scroll-linked glow        — radial glow that tracks scroll position,
 *                                  illuminating the section you're reading
 *   6. Scope vignette            — radial + linear gradient, dark at
 *                                  viewport edges → "emerging from darkness"
 *
 * All layers are pointer-events-none and aria-hidden.
 * The scroll handler mirrors the compass: passive listener, no jank.
 */
export default function GlobalBackground() {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (!glowRef.current) return
      const total    = document.documentElement.scrollHeight - window.innerHeight
      const progress = total > 0 ? Math.min(window.scrollY / total, 1) : 0
      // Glow centre moves from 18 % (top of page) to 82 % (bottom of page)
      const y = 18 + progress * 64
      glowRef.current.style.background =
        `radial-gradient(ellipse 70% 42% at 50% ${y}%, rgba(61,214,176,0.055) 0%, transparent 68%)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* 1 ── Concentric radar rings — masked so outer rings fade out, no hard clip */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: `repeating-radial-gradient(
            circle at 50% 44%,
            transparent 0px,
            transparent 74px,
            rgba(61,214,176,0.018) 74px,
            rgba(61,214,176,0.018) 75px
          )`,
          maskImage:       'radial-gradient(ellipse 88% 88% at 50% 44%, black 0%, black 55%, transparent 82%)',
          WebkitMaskImage: 'radial-gradient(ellipse 88% 88% at 50% 44%, black 0%, black 55%, transparent 82%)',
        }}
      />

      {/* 2 ── Cardinal axis lines through the radar centre */}
      <svg
        aria-hidden="true"
        className="fixed inset-0 w-full h-full z-[1] pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        {/* Vertical axis */}
        <line x1="50%" y1="0%" x2="50%" y2="100%"
          stroke="rgba(61,214,176,0.020)" strokeWidth="1" />
        {/* Horizontal axis at radar-centre height */}
        <line x1="0%" y1="44%" x2="100%" y2="44%"
          stroke="rgba(61,214,176,0.020)" strokeWidth="1" />
        {/* Subtle diagonal cross */}
        <line x1="20%" y1="0%" x2="80%" y2="100%"
          stroke="rgba(61,214,176,0.007)" strokeWidth="1" />
        <line x1="80%" y1="0%" x2="20%" y2="100%"
          stroke="rgba(61,214,176,0.007)" strokeWidth="1" />
      </svg>

      {/* 3 ── Fine grid crosshatch */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(61,214,176,0.013) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,214,176,0.013) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 4 ── Radar sweep beam (CSS animated) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none radar-sweep-beam"
      />

      {/* 5 ── Scroll-linked accent glow */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 42% at 50% 18%, rgba(61,214,176,0.055) 0%, transparent 68%)',
        }}
      />

      {/* 6 ── Scope vignette — "page emerging from darkness" */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 95% 90% at 50% 50%,
              transparent 52%,
              rgba(7,15,21,0.45) 80%,
              rgba(7,15,21,0.80) 100%
            ),
            linear-gradient(to bottom,
              rgba(7,15,21,0.72) 0%,
              transparent 13%,
              transparent 87%,
              rgba(7,15,21,0.72) 100%
            )
          `,
        }}
      />
    </>
  )
}
