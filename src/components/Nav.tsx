'use client'

import Link from 'next/link'
import { useState } from 'react'
import Logo from './Logo'

const navLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms',   href: '/terms'   },
  { label: 'Support', href: '/support' },
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.06)] bg-[rgba(7,15,21,0.82)] backdrop-blur-xl backdrop-saturate-150">
      <div className="section-container">
        <div className="flex h-14 items-center justify-between">

          {/* Logo */}
          <Logo size="sm" />

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6" aria-label="Site navigation">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}

            {/* Sign In button */}
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border border-[rgba(61,214,176,0.30)] text-[#3DD6B0] hover:bg-[rgba(61,214,176,0.08)] hover:border-[rgba(61,214,176,0.50)] transition-all duration-200"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M1.5 12.5c0-2.5 2.4-4.5 5.5-4.5s5.5 2 5.5 4.5"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Sign In
            </Link>
          </nav>

          {/* Mobile: sign in + hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <Link
              href="/signin"
              className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[rgba(61,214,176,0.28)] text-[#3DD6B0]"
            >
              Sign In
            </Link>
            <button
              className="p-2 rounded-lg text-[#6E9BAA] hover:text-[#E8F5F2] transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[rgba(255,255,255,0.06)] bg-[rgba(7,15,21,0.95)] px-5 pb-4 pt-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2.5 text-sm font-medium text-[#8CB4C0] hover:text-[#E8F5F2] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
