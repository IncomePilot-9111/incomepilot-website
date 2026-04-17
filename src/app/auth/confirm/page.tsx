/**
 * /auth/confirm
 *
 * Supabase auth callback page.
 *
 * Handles:
 *   • Email verification  (token_hash + type = email/signup/email_change)
 *   • Password reset      (type = recovery)
 *   • Magic-link sign-in  (type = magiclink)
 *
 * Flow:
 *  1. Parse token_hash + type (or code when present) from URL search params
 *  2. Call supabase.auth.verifyOtp() for token-hash links
 *  3. On success → attempt to open app via deep link, then show success UI
 *  4. On error  → show clean branded error state, guide user to retry
 *
 * This page must be set as the "Site URL" / redirect base in your
 * Supabase project settings, e.g.:
 *   Site URL: https://incomepilot.app
 *   Redirect URL pattern: https://incomepilot.app/auth/**
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import AuthConfirmContent from './AuthConfirmContent'
import Logo from '@/components/Logo'

export const metadata: Metadata = {
  title: 'Verifying your email',
  robots: { index: false, follow: false },
}

export default function AuthConfirmPage() {
  return (
    <div className="min-h-screen bg-[#070F15] flex flex-col">
      {/* Minimal header */}
      <header className="px-5 py-4 border-b border-[rgba(255,255,255,0.05)]">
        <Logo size="sm" />
      </header>

      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(61,214,176,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <Suspense fallback={<AuthLoadingState />}>
          <AuthConfirmContent />
        </Suspense>
      </main>

      {/* Minimal footer */}
      <footer className="px-5 py-4 border-t border-[rgba(255,255,255,0.05)] text-center">
        <p className="text-xs text-[#2E5060]">
          &copy; {new Date().getFullYear()} IncomePilot &nbsp;·&nbsp;
          <a href="/privacy" className="hover:text-[#3DD6B0] transition-colors">Privacy</a>
        </p>
      </footer>
    </div>
  )
}

function AuthLoadingState() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="spinner" />
      <p className="text-sm text-[#6E9BAA]">Checking your link…</p>
    </div>
  )
}
