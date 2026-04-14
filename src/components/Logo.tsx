import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  /** Show wordmark beside the icon */
  wordmark?: boolean
  /** Override link href; defaults to '/' */
  href?: string
}

export default function Logo({
  size = 'md',
  wordmark = true,
  href = '/',
}: LogoProps) {
  const dims = { sm: 28, md: 36, lg: 44 }[size]
  const textSize = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }[size]

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 group select-none"
      aria-label="IncomePilot home"
    >
      {/* Mark — circular, clipped to circle */}
      <div
        className="flex-shrink-0 rounded-full overflow-hidden"
        style={{ width: dims, height: dims }}
        aria-hidden="true"
      >
        <Image
          src="/logo.png"
          alt=""
          width={dims}
          height={dims}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Wordmark */}
      {wordmark && (
        <span
          className={`${textSize} font-bold tracking-tight text-[#E8F5F2] group-hover:text-[#3DD6B0] transition-colors duration-200`}
        >
          Income<span className="text-[#3DD6B0]">Pilot</span>
        </span>
      )}
    </Link>
  )
}
