/**
 * ValkodaWordmark
 *
 * Renders the VALKODA brand wordmark where:
 *  - Every 'A' is a custom Λ-style glyph (no crossbar, two bold legs meeting at apex)
 *  - The final 'A' contains a solid navigator-delta triangle inside the counter
 *
 * Letterform strokes use `currentColor` so they inherit and respond to
 * hover/active colour changes on the parent.
 */

interface LetterAProps {
  /** When true, renders the navigator delta inside the counter */
  nav?: boolean
  /**
   * accent — the branded final-A variant.
   * true  → slightly taller (0.80em) so it reads as a signature mark.
   * false → exactly 1cap tall so it sits flush with V, L, K, O, D.
   */
  accent?: boolean
}

function LetterA({ nav = false, accent = false }: LetterAProps) {
  return (
    <svg
      viewBox="0 0 50 66"
      aria-hidden="true"
      style={{
        display:    'inline-block',
        width:      accent ? '0.64em' : '0.60em',
        /* 1cap = exact cap-height of the current font — matches V/L/K/O/D visually.
           accent version is intentionally taller as the signature mark. */
        height:     accent ? '0.80em' : '1cap',
        flexShrink: 0,
        overflow:   'visible',
      }}
    >
      {/* Left leg: apex → lower-left foot */}
      <line
        x1="25" y1="2"
        x2="2"  y2="64"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Right leg: apex → lower-right foot */}
      <line
        x1="25" y1="2"
        x2="48" y2="64"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {nav && (
        /* Navigator delta — upward triangle inside the A counter */
        <polygon points="25,21 38,54 12,54" fill="#1D7272" />
      )}
    </svg>
  )
}

interface ValkodaWordmarkProps {
  /** Extra Tailwind / inline classes forwarded to the container (font-size, colour, etc.) */
  className?: string
}

/**
 * Renders  V Λ L K O D Λ̂
 * where Λ = crossbar-free A glyph and Λ̂ = A with navigator delta inside.
 */
export default function ValkodaWordmark({ className = '' }: ValkodaWordmarkProps) {
  return (
    <span
      className={`brand-wordmark ${className}`}
      aria-label="VALKODA"
      style={{
        display: 'inline-flex',
        /* baseline: SVG bottom-edge anchors on the text baseline, same as glyphs */
        alignItems: 'baseline',
        /* Override brand-wordmark letter-spacing — gap handles all spacing */
        letterSpacing: 0,
        gap: '0.15em',
      }}
    >
      {/* V — standard Rajdhani */}
      <span>V</span>
      {/* First A — custom Λ glyph, 1cap tall, matches V/L/K/O/D cap height */}
      <LetterA />
      {/* L K O D — standard Rajdhani */}
      <span>L</span>
      <span>K</span>
      <span>O</span>
      <span>D</span>
      {/* Final A — accent Λ with navigator delta inside, intentionally taller */}
      <LetterA nav accent />
    </span>
  )
}
