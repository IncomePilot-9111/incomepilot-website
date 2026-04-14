'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient, buildAuthVerifiedDeepLink, tryOpenApp } from '@/lib/supabase'

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type VerifyState =
  | { status: 'loading' }
  | { status: 'success'; appOpened: boolean }
  | { status: 'error'; heading: string; detail: string; canRetry: boolean }

type OtpType = 'signup' | 'email_change' | 'recovery' | 'magiclink' | 'invite'

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

function friendlyErrorMessage(raw: string): { heading: string; detail: string; canRetry: boolean } {
  const lower = raw.toLowerCase()

  if (lower.includes('expired')) {
    return {
      heading: 'This link has expired',
      detail:
        'Email verification links are only valid for a short time. ' +
        'Return to the app and request a new one.',
      canRetry: true,
    }
  }

  if (lower.includes('already') || lower.includes('used')) {
    return {
      heading: 'Link already used',
      detail: 'This verification link has already been used. You can sign in directly in the app.',
      canRetry: false,
    }
  }

  if (lower.includes('invalid') || lower.includes('not found')) {
    return {
      heading: 'Invalid verification link',
      detail:
        "We couldn't verify this link. It may be malformed or from an older email. " +
        'Please request a fresh one from the app.',
      canRetry: true,
    }
  }

  // Generic fallback — never expose raw error text to the user
  return {
    heading: 'Verification failed',
    detail:
      'Something went wrong while confirming your email. ' +
      'Please return to the app and try again.',
    canRetry: true,
  }
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function AuthConfirmContent() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<VerifyState>({ status: 'loading' })
  // Prevent double-run in StrictMode dev
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    void handleVerification()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleVerification() {
    /* ── 1. Read URL params ── */
    const token_hash      = searchParams.get('token_hash')
    const type            = searchParams.get('type') as OtpType | null
    const urlError        = searchParams.get('error')
    const urlErrorDesc    = searchParams.get('error_description')

    // Supabase occasionally sends error= directly in the redirect URL
    if (urlError) {
      const mapped = friendlyErrorMessage(urlErrorDesc ?? urlError)
      setState({ status: 'error', ...mapped })
      return
    }

    if (!token_hash || !type) {
      setState({
        status: 'error',
        heading: 'Invalid verification link',
        detail:
          'This link is missing required information. ' +
          'Please try the link in your email again, or request a new one from the app.',
        canRetry: true,
      })
      return
    }

    /* ── 2. Exchange token with Supabase ── */
    let supabase: ReturnType<typeof createBrowserClient>
    try {
      supabase = createBrowserClient()
    } catch {
      setState({
        status: 'error',
        heading: 'Service unavailable',
        detail: 'IncomePilot is having trouble connecting right now. Please try again in a moment.',
        canRetry: true,
      })
      return
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })

    if (verifyError) {
      const mapped = friendlyErrorMessage(verifyError.message)
      setState({ status: 'error', ...mapped })
      return
    }

    /* ── 3. Success — attempt to open the app ── */
    // First render the success state so the user isn't left with a blank screen
    setState({ status: 'success', appOpened: false })

    // Small breathing room before firing the deep link
    await new Promise((r) => setTimeout(r, 600))

    const deepLink = buildAuthVerifiedDeepLink()
    const opened   = await tryOpenApp(deepLink)

    setState({ status: 'success', appOpened: opened })
  }

  /* ── Render ── */
  if (state.status === 'loading') {
    return <LoadingView />
  }

  if (state.status === 'error') {
    return <ErrorView heading={state.heading} detail={state.detail} canRetry={state.canRetry} />
  }

  return <SuccessView appOpened={state.appOpened} />
}

/* ─── Views ─────────────────────────────────────────────────────────────────── */

function LoadingView() {
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-xs">
      {/* Animated compass mark */}
      <div className="relative w-16 h-16">
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full"
          aria-label="Verifying…"
          role="img"
        >
          <circle
            cx="32" cy="32" r="28"
            stroke="rgba(61,214,176,0.15)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="6 10"
            className="animate-[spin_3s_linear_infinite]"
            style={{ transformOrigin: '32px 32px' }}
          />
          <circle
            cx="32" cy="32" r="18"
            stroke="rgba(61,214,176,0.25)"
            strokeWidth="1"
            fill="none"
          />
          <path d="M32 32 L29.5 14 L32 18.5 L34.5 14 Z" fill="#3DD6B0" />
          <path d="M32 32 L30 50 L32 45.5 L34 50 Z" fill="rgba(61,214,176,0.3)" />
          <circle cx="32" cy="32" r="3" fill="#3DD6B0" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-[#E8F5F2]">Verifying your email…</p>
        <p className="text-sm text-[#6E9BAA] mt-1.5">Just a moment.</p>
      </div>
    </div>
  )
}

function SuccessView({ appOpened }: { appOpened: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm animate-fade-up">
      {/* Success icon */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center border border-[rgba(61,214,176,0.30)]"
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
        {/* Outer pulse ring */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-[rgba(61,214,176,0.15)] animate-ping"
          style={{ animationDuration: '2.5s' }}
        />
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#E8F5F2]">
          Verified successfully
        </h1>
        <p className="text-[#8CB4C0] leading-relaxed">
          Your email has been confirmed successfully.
        </p>
        <p className="text-sm text-[#6E9BAA] mt-1">
          You can safely close this page and begin your IncomePilot journey in the app.
        </p>
      </div>

      {/* Helper message depending on whether app opened */}
      <div className="w-full glass-card p-4 mt-2">
        {appOpened ? (
          <div className="flex items-start gap-3 text-left">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="7" stroke="#3DD6B0" strokeWidth="1.2" />
              <path d="M5.5 8l2 2 3-3.5" stroke="#3DD6B0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-xs text-[#6E9BAA]">
              IncomePilot should be open on your device. If not, open the app and sign in.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 text-left">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="7" stroke="rgba(61,214,176,0.50)" strokeWidth="1.2" />
              <path d="M8 5v4M8 11v.5" stroke="rgba(61,214,176,0.70)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p className="text-xs text-[#6E9BAA]">
              If IncomePilot does not open automatically, return to the app and sign in there.
            </p>
          </div>
        )}
      </div>

      {/* Close / open app hint */}
      <p className="text-xs text-[#3E6474]">
        This browser tab can be safely closed.
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
    <div className="flex flex-col items-center gap-6 text-center max-w-sm animate-fade-up">
      {/* Error icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center border border-[rgba(255,100,100,0.25)]"
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

      {/* Copy */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-[#E8F5F2]">{heading}</h1>
        <p className="text-sm text-[#8CB4C0] leading-relaxed">{detail}</p>
      </div>

      {/* Guidance card */}
      {canRetry && (
        <div className="w-full glass-card p-4 mt-1">
          <div className="flex items-start gap-3 text-left">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="7" stroke="rgba(61,214,176,0.40)" strokeWidth="1.2" />
              <path d="M8 5v4M8 11v.5" stroke="rgba(61,214,176,0.60)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <div className="text-xs text-[#6E9BAA] space-y-1">
              <p className="font-semibold text-[#8CB4C0]">What to do next</p>
              <p>Open IncomePilot on your device and choose <em>Resend verification email</em> from the sign-in screen. Then tap the new link in your inbox.</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-[#3E6474]">
        Need help?{' '}
        <a href="/support" className="text-[#4A8A9A] hover:text-[#3DD6B0] transition-colors underline underline-offset-2">
          Contact support
        </a>
      </p>
    </div>
  )
}
