import Link from 'next/link'
import ValkodaWordmark from './ValkodaWordmark'

interface LogoProps {
  /** Visual size preset */
  size?: 'sm' | 'md' | 'lg'
  /** Show full wordmark; false shows only 'V' */
  wordmark?: boolean
  /** Override link href; defaults to '/' */
  href?: string
}

/**
 * Logo: renders the VALKODA brand wordmark.
 * Uses ValkodaWordmark for the full wordmark (both A's as custom Λ glyphs,
 * final A with navigator delta inside), or a plain 'V' for the compact form.
 */
export default function Logo({
  size = 'md',
  wordmark = true,
  href = '/',
}: LogoProps) {
  const textSize = {
    sm: 'text-[0.92rem]',
    md: 'text-[1.08rem]',
    lg: 'text-[1.3rem]',
  }[size]

  return (
    <Link
      href={href}
      className="inline-flex items-center leading-none group select-none"
      aria-label="Valkoda home"
    >
      {wordmark ? (
        <ValkodaWordmark
          className={`${textSize} text-[#F5F7FB] group-hover:text-[#3DD6B0] transition-colors duration-200`}
        />
      ) : (
        <span
          className={`${textSize} brand-wordmark text-[#F5F7FB] group-hover:text-[#3DD6B0] transition-colors duration-200`}
        >
          V
        </span>
      )}
    </Link>
  )
}
