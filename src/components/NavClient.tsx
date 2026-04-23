'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { normalizeAuthMessage } from '@/lib/auth-helpers'
import Logo from './Logo'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'PolarisPilot', href: '/#polarispilot' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/support' },
]

export default function NavClient({ userEmail }: { userEmail: string | null }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const isSignedIn = Boolean(userEmail)

  async function handleSignOut() {
    setErrorMessage('')
    setIsSigningOut(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      setIsSigningOut(false)
      setErrorMessage(
        normalizeAuthMessage(
          error.message,
          'Unable to sign out right now. Please try again.',
        ),
      )
      return
    }

    setMobileOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.05)] bg-[rgba(2,6,8,0.94)] backdrop-blur-xl backdrop-saturate-150">
      <div className="section-container">
        <div className="flex h-14 items-center justify-between gap-4">
          <Logo size="sm" />

          <nav className="hidden sm:flex items-center gap-6" aria-label="Site navigation">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}

            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-sm font-medium text-[#8CB4C0] transition-colors duration-200 hover:border-[rgba(61,214,176,0.35)] hover:text-[#E8F5F2]"
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <circle cx="7" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.4" />
                        <path
                          d="M1.5 12.5c0-2.5 2.4-4.5 5.5-4.5s5.5 2 5.5 4.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="truncate">{userEmail}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.10)] px-4 py-1.5 text-sm font-semibold text-[#E8F5F2] transition-all duration-200 hover:border-[rgba(61,214,176,0.35)] hover:bg-[rgba(61,214,176,0.08)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M5 2.5H3.75A1.75 1.75 0 0 0 2 4.25v5.5A1.75 1.75 0 0 0 3.75 11.5H5"
                          stroke="currentColor"
                          strokeWidth="1.35"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 4l3 3-3 3M11 7H5"
                          stroke="currentColor"
                          strokeWidth="1.35"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>

                  {errorMessage ? (
                    <p className="max-w-[240px] text-right text-xs text-[#F6B6B6]" role="alert">
                      {errorMessage}
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border border-[rgba(61,214,176,0.30)] text-[#3DD6B0] hover:bg-[rgba(61,214,176,0.08)] hover:border-[rgba(61,214,176,0.50)] transition-all duration-200"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M1.5 12.5c0-2.5 2.4-4.5 5.5-4.5s5.5 2 5.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                Sign In
              </Link>
            )}
          </nav>

          <div className="sm:hidden flex items-center gap-2">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex max-w-[145px] items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs font-semibold text-[#8CB4C0]"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M1.5 12.5c0-2.5 2.4-4.5 5.5-4.5s5.5 2 5.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="truncate">{userEmail}</span>
              </Link>
            ) : (
              <Link
                href="/signin"
                className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[rgba(61,214,176,0.28)] text-[#3DD6B0]"
              >
                Sign In
              </Link>
            )}

            <button
              className="p-2 rounded-lg text-[#6E9BAA] hover:text-[#E8F5F2] transition-colors"
              onClick={() => setMobileOpen((value) => !value)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M3 6h14M3 10h14M3 14h14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-[rgba(255,255,255,0.05)] bg-[rgba(2,6,8,0.97)] px-5 pb-4 pt-3 space-y-1">
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

          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="block py-2.5 text-sm font-medium text-[#8CB4C0] hover:text-[#E8F5F2] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <div className="pt-3 mt-2 border-t border-[rgba(255,255,255,0.06)] space-y-3">
                <p className="text-xs text-[#4A7A8A]">Signed in as</p>
                <p className="text-sm font-medium text-[#E8F5F2] break-all">{userEmail}</p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.10)] px-4 text-sm font-semibold text-[#E8F5F2] transition-all duration-200 hover:border-[rgba(61,214,176,0.35)] hover:bg-[rgba(61,214,176,0.08)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </button>
                {errorMessage ? (
                  <p className="text-xs text-[#F6B6B6]" role="alert">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <Link
              href="/signin"
              className="block py-2.5 text-sm font-medium text-[#3DD6B0] hover:text-[#5EE4C0] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
