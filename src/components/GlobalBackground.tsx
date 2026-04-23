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
        `radial-gradient(ellipse 80% 50% at 50% ${y}%, rgba(61,214,176,0.155) 0%, transparent 70%)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* 5 ── Scroll-linked accent glow */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 18%, rgba(61,214,176,0.155) 0%, transparent 70%)',
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
              rgba(10,22,30,0.38) 80%,
              rgba(10,22,30,0.72) 100%
            ),
            linear-gradient(to bottom,
              rgba(10,22,30,0.62) 0%,
              transparent 13%,
              transparent 87%,
              rgba(10,22,30,0.62) 100%
            )
          `,
        }}
      />
    </>
  )
}
