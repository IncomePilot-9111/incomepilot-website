import type { ReactNode } from 'react'
import Nav from './Nav'
import Footer from './Footer'

interface LegalLayoutProps {
  title: string
  subtitle?: string
  lastUpdated: string
  children: ReactNode
}

/**
 * Shared layout wrapper for Privacy, Terms, and similar legal pages.
 */
export default function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />

      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-80"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(61,214,176,0.06) 0%, transparent 70%)',
        }}
      />

      <main className="flex-1 relative">
        <div className="section-container pt-14 pb-24">

          {/* Header */}
          <div className="max-w-2xl mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#E8F5F2] mb-3">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[#6E9BAA] text-base">{subtitle}</p>
            )}
            <p className="text-xs text-[#3E6474] mt-4">
              Last updated: {lastUpdated}
            </p>
          </div>

          <hr className="divider mb-10" />

          {/* Content */}
          <div className="max-w-2xl legal-prose">
            {children}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
