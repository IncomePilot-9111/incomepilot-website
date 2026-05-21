'use client'

/**
 * /auth/confirm  -- email verification handler
 *
 * Verifies the token_hash + type supplied by Supabase in the confirmation email.
 *
 * Anti-prefetch design: verifyOtp is intentionally NOT called on mount.
 * Email prefetchers, in-app-browser double-loads, and reloads must not consume
 * the single-use token before the user's intentional tap. The token is only
 * exchanged when the user explicitly presses "Confirm my email".
 *
 * State machine:
 *   idle       -- token_hash present in URL, waiting for user click (CTA shown)
 *   invalid    -- token_hash/type absent/malformed on load -> hard error, no CTA
 *   verifying  -- CTA clicked, verifyOtp in-flight (button disabled + spinner)
 *   success    -- token accepted -> "Verified successfully" screen
 *   soft-error -- token already used/expired -> reassuring "you may be all set" screen
 *   error      -- network/service failure -> hard error with retry guidance
 */

import type { EmailOtpType } from '@supabase/supabase-js'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

type ConfirmState =
  | { status: 'idle' }
  | { status: 'invalid' }
  | { status: 'verifying' }
  | { status: 'success' }
  | { status: 'soft-error' }
  | { status: 'error'; heading: string; detail: string; canRetry: boolean }

export default function AuthConfirmContent() {
  const searchParams = useSearchParams()

  // Parse URL params at first render -- pure read, no network.
  const tokenHash = searchParams.get('token_hash')?.trim() || null
  const type = (searchParams.get('type')?.trim() || 'email') as EmailOtpType

  // Initial state is determined by whether a usable token_hash is in the URL.
  // This avoids a useEffect and keeps the no-network-on-load guarantee.
  const [state, setState] = useState<ConfirmState>(
    tokenHash ? { status: 'idle' } : { status: 'invalid' },
  )

  /* ── CTA click handler -- the ONLY place verifyOtp is called ──────────── */

  async function handleCTAClick() {
    // token_hash was validated at render; idle state won't show the CTA without it.
    if (!tokenHash) return

    setState({ status: 'verifying' })

    let supabase: ReturnType<typeof createBrowserClient>
    try {
      supabase = createBrowserClient({ detectSessionInUrl: false })
    } catch {
      setState({
        status: 'error',
        heading: 'Service unavailable',
        detail:
          'PolarisPilot is having trouble connecting right now. Please try again in a moment.',
        canRetry: true,
      })
      return
    }

    // Wrap in try/catch + 15 s timeout (ed92e50) so a thrown exception
    // (network error, fetch failed) or a hung request surfaces as an error
    // instead of leaving the page stuck on the verifying spinner.
    let verifyError: { message: string } | null = null
    try {
      const TIMEOUT_MS = 15_000
      const result = await Promise.race([
        supabase.auth.verifyOtp({ token_hash: tokenHash, type }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS),
        ),
      ])
      verifyError = result.error
    } catch (e) {
      // Thrown = network/fetch/timeout error -> hard service error, safe to retry.
      setState({
        status: 'error',
        heading: 'Service unavailable',
        detail:
          e instanceof Error && e.message === 'timeout'
            ? 'The verification request took too long. Please check your connection and try again.'
            : 'PolarisPilot is having trouble connecting right now. Please try again in a moment.',
        canRetry: true,
      })
      return
    }

    if (verifyError) {
      // verifyOtp returned an API-level error object. This means Supabase
      // processed the request but rejected the token -- almost always because
      // it was already consumed (prefetch, double-tap, or reload) or expired.
      // Show the soft screen rather than a hard failure.
      setState({ status: 'soft-error' })
      return
    }

    setState({ status: 'success' })
  }

  /* ── Render ───────────────────────────────────────────────────────────── */

  if (state.status === 'idle')      return <CTAView onConfirm={handleCTAClick} />
  if (state.status === 'verifying') return <VerifyingView />
  if (state.status === 'success')   return <SuccessView />
  if (state.status === 'soft-error') return <SoftErrorView />
  if (state.status === 'invalid')   return <InvalidView />

  // status === 'error'
  return (
    <ErrorView
      heading={state.heading}
      detail={state.detail}
      canRetry={state.canRetry}
    />
  )
}

/* ──────────────────────────── Sub-views ─────────────────────────────────── */

function CTAView({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="animate-fade-up flex max-w-sm flex-col items-center gap-6 text-center">
      {/* Icon */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(61,214,176,0.30)]"
        style={{
          background:
            'radial-gradient(circle, rgba(61,214,176,0.12) 0%, rgba(61,214,176,0.03) 100%)',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <rect x="4" y="9" width="28" height="20" rx="3" stroke="#3DD6B0" strokeWidth="1.8" fill="none" />
          <path d="M4 13l14 10 14-10" stroke="#3DD6B0" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#E8F5F2]">Confirm your email</h1>
        <p className="leading-relaxed text-[#8CB4C0]">
          Tap the button below to verify your PolarisPilot account.
        </p>
        <p className="text-xs text-[#4A7A8A]">
          This link can only be used once, so tap when you are ready.
        </p>
      </div>

      <button
        onClick={onConfirm}
        className="w-full max-w-xs h-12 rounded-xl font-bold text-sm text-[#070F15] relative overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, #3DD6B0 0%, #2ABFA0 100%)',
          boxShadow: '0 4px 24px rgba(61,214,176,0.25)',
        }}
      >
        <span className="relative z-10">Confirm my email</span>
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'linear-gradient(135deg, #5EE4C0 0%, #3DD6B0 100%)' }}
        />
      </button>
    </div>
  )
}

function VerifyingView() {
  return (
    <div className="flex max-w-xs flex-col items-center gap-6 text-center">
      <div className="relative h-16 w-16">
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full"
          aria-label="Verifying your link"
          role="img"
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="rgba(61,214,176,0.15)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="6 10"
            className="animate-[spin_3s_linear_infinite]"
            style={{ transformOrigin: '32px 32px' }}
          />
          <circle cx="32" cy="32" r="18" stroke="rgba(61,214,176,0.25)" strokeWidth="1" fill="none" />
          <path d="M32 32 L29.5 14 L32 18.5 L34.5 14 Z" fill="#3DD6B0" />
          <path d="M32 32 L30 50 L32 45.5 L34 50 Z" fill="rgba(61,214,176,0.3)" />
          <circle cx="32" cy="32" r="3" fill="#3DD6B0" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-[#E8F5F2]">Verifying your link...</p>
        <p className="mt-1.5 text-sm text-[#6E9BAA]">Just a moment.</p>
      </div>
    </div>
  )
}

function SuccessView() {
  return (
    <div className="animate-fade-up flex max-w-sm flex-col items-center gap-6 text-center">
      <div className="relative">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(61,214,176,0.30)]"
          style={{
            background:
              'radial-gradient(circle, rgba(61,214,176,0.14) 0%, rgba(61,214,176,0.04) 100%)',
            boxShadow: '0 0 40px rgba(61,214,176,0.14)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path
              d="M8 18l7 7 13-14"
              stroke="#3DD6B0"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-[rgba(61,214,176,0.15)] animate-ping"
          style={{ animationDuration: '2.5s' }}
        />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#E8F5F2]">Verified successfully</h1>
        <p className="leading-relaxed text-[#8CB4C0]">
          Your email has been confirmed.
        </p>
        <p className="mt-1 text-sm text-[#6E9BAA]">
          Open PolarisPilot on your device and sign in to continue.
        </p>
      </div>

      <p className="text-xs text-[#3E6474]">This browser tab can be safely closed.</p>
    </div>
  )
}

function SoftErrorView() {
  return (
    <div className="animate-fade-up flex max-w-sm flex-col items-center gap-6 text-center">
      {/* Info icon -- neutral, not alarming */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(61,214,176,0.22)]"
        style={{
          background:
            'radial-gradient(circle, rgba(61,214,176,0.08) 0%, rgba(61,214,176,0.02) 100%)',
        }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <circle cx="17" cy="17" r="13" stroke="rgba(61,214,176,0.55)" strokeWidth="1.6" fill="none" />
          <path
            d="M17 11v7M17 21v2"
            stroke="rgba(61,214,176,0.80)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-[#E8F5F2]">This link may already have been used</h1>
        <p className="leading-relaxed text-[#8CB4C0]">
          If you just confirmed your email, you&apos;re all set. Open PolarisPilot on your
          device and sign in.
        </p>
      </div>

      <div className="glass-card w-full p-4">
        <div className="flex items-start gap-3 text-left">
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            aria-hidden="true" className="mt-0.5 flex-shrink-0"
          >
            <circle cx="8" cy="8" r="7" stroke="rgba(61,214,176,0.40)" strokeWidth="1.2" />
            <path d="M8 5v4M8 11v.5" stroke="rgba(61,214,176,0.60)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <div className="space-y-1 text-xs text-[#6E9BAA]">
            <p className="font-semibold text-[#8CB4C0]">Haven&apos;t confirmed yet?</p>
            <p>
              Open PolarisPilot and choose <em>Resend verification email</em> from the
              sign-in screen. Then tap the fresh link from your inbox.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#3E6474]">
        Need help?{' '}
        <a
          href="/support"
          className="text-[#4A8A9A] underline underline-offset-2 transition-colors hover:text-[#3DD6B0]"
        >
          Contact support
        </a>
      </p>
    </div>
  )
}

function InvalidView() {
  return (
    <div className="animate-fade-up flex max-w-sm flex-col items-center gap-6 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(255,100,100,0.25)]"
        style={{
          background:
            'radial-gradient(circle, rgba(255,80,80,0.10) 0%, rgba(255,80,80,0.03) 100%)',
        }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <path
            d="M17 11v8M17 22.5v.5"
            stroke="rgba(255,120,120,0.90)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M14.5 5.6L3.2 25a2.9 2.9 0 002.5 4.4h22.6a2.9 2.9 0 002.5-4.4L19.5 5.6a2.9 2.9 0 00-5 0z"
            stroke="rgba(255,120,120,0.60)"
            strokeWidth="1.6"
            fill="none"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-[#E8F5F2]">Verification link unavailable</h1>
        <p className="text-sm leading-relaxed text-[#8CB4C0]">
          This link is missing required information. Please return to PolarisPilot and
          request a new verification email.
        </p>
      </div>

      <div className="glass-card w-full p-4">
        <div className="flex items-start gap-3 text-left">
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            aria-hidden="true" className="mt-0.5 flex-shrink-0"
          >
            <circle cx="8" cy="8" r="7" stroke="rgba(61,214,176,0.40)" strokeWidth="1.2" />
            <path d="M8 5v4M8 11v.5" stroke="rgba(61,214,176,0.60)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <div className="space-y-1 text-xs text-[#6E9BAA]">
            <p className="font-semibold text-[#8CB4C0]">What to do next</p>
            <p>
              Open PolarisPilot on your device and choose <em>Resend verification email</em> from
              the sign-in screen. Then tap the new link in your inbox.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#3E6474]">
        Need help?{' '}
        <a
          href="/support"
          className="text-[#4A8A9A] underline underline-offset-2 transition-colors hover:text-[#3DD6B0]"
        >
          Contact support
        </a>
      </p>
    </div>
  )
}

function ErrorView({
  heading,
  detail,
  canRetry,
}: {
  heading: string
  detail: string
  canRetry: boolean
}) {
  return (
    <div className="animate-fade-up flex max-w-sm flex-col items-center gap-6 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(255,100,100,0.25)]"
        style={{
          background:
            'radial-gradient(circle, rgba(255,80,80,0.10) 0%, rgba(255,80,80,0.03) 100%)',
        }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <path
            d="M17 11v8M17 22.5v.5"
            stroke="rgba(255,120,120,0.90)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M14.5 5.6L3.2 25a2.9 2.9 0 002.5 4.4h22.6a2.9 2.9 0 002.5-4.4L19.5 5.6a2.9 2.9 0 00-5 0z"
            stroke="rgba(255,120,120,0.60)"
            strokeWidth="1.6"
            fill="none"
          />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-[#E8F5F2]">{heading}</h1>
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#8CB4C0]">{detail}</p>
      </div>

      {canRetry && (
        <div className="glass-card mt-1 w-full p-4">
          <div className="flex items-start gap-3 text-left">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="mt-0.5 flex-shrink-0"
            >
              <circle cx="8" cy="8" r="7" stroke="rgba(61,214,176,0.40)" strokeWidth="1.2" />
              <path
                d="M8 5v4M8 11v.5"
                stroke="rgba(61,214,176,0.60)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <div className="space-y-1 text-xs text-[#6E9BAA]">
              <p className="font-semibold text-[#8CB4C0]">What to do next</p>
              <p>
                Open PolarisPilot on your device and choose <em>Resend verification email</em> from
                the sign-in screen. Then tap the new link in your inbox.
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-[#3E6474]">
        Need help?{' '}
        <a
          href="/support"
          className="text-[#4A8A9A] underline underline-offset-2 transition-colors hover:text-[#3DD6B0]"
        >
          Contact support
        </a>
      </p>
    </div>
  )
}
