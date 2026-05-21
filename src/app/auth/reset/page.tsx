/**
 * /auth/reset
 *
 * Password-reset handler for the mobile-app email flow.
 *
 * Supabase sends emails with a link like:
 *   https://valkoda.app/auth/reset?token_hash=...&type=recovery
 *
 * Flow:
 *  1. Parse token_hash + type from URL search params
 *  2. Call supabase.auth.verifyOtp() to establish a recovery session
 *  3. Show a form to choose a new password
 *  4. Call supabase.auth.updateUser({ password }) on submit
 *  5. Show a success state — user returns to the app to sign in
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import AuthResetContent from './AuthResetContent'
import Logo from '@/components/Logo'

export const metadata: Metadata = {
  title: 'Reset your PolarisPilot password',
  robots: { index: false, follow: false },
}

export default function AuthResetPage() {
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
        <Suspense fallback={<AuthResetLoadingState />}>
          <AuthResetContent />
        </Suspense>
      </main>

      {/* Minimal footer */}
      <footer className="px-5 py-4 border-t border-[rgba(255,255,255,0.05)] text-center">
        <p className="text-xs text-[#2E5060]">
          &copy; {new Date().getFullYear()} Valkoda &nbsp;&middot;&nbsp;
          <a href="/privacy" className="hover:text-[#3DD6B0] transition-colors">Privacy</a>
        </p>
      </footer>
    </div>
  )
}

function AuthResetLoadingState() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="spinner" />
      <p className="text-sm text-[#6E9BAA]">Verifying your reset link...</p>
    </div>
  )
}
