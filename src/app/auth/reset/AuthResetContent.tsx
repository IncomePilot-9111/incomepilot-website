'use client'

/**
 * Two-phase reset flow:
 *
 * Phase 1 (verifying)  -- On mount, verify the token_hash from the URL.
 *                         If valid, Supabase establishes a recovery session
 *                         which authorises the subsequent updateUser call.
 *
 * Phase 2 (form)       -- Show a password + confirm-password form.
 *                         On submit, call supabase.auth.updateUser({ password }).
 *
 * Phase 3 (done)       -- Show a success state. The user returns to the app
 *                         and signs in with the new password.
 */

import type { EmailOtpType } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import { mapVerificationFailure } from '@/lib/auth-confirm'
import { normalizeAuthMessage } from '@/lib/auth-helpers'

type Phase =
  | { kind: 'verifying' }
  | { kind: 'form' }
  | { kind: 'done' }
  | { kind: 'error'; heading: string; detail: string; canRetry: boolean }

export default function AuthResetContent() {
  const searchParams = useSearchParams()
  const hasRun = useRef(false)
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null)

  const [phase, setPhase] = useState<Phase>({ kind: 'verifying' })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  /* ── Phase 1: verify OTP on mount ────────────────────────────────────── */

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    void verifyToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function verifyToken() {
    const tokenHash = searchParams.get('token_hash')?.trim() || null
    const type = (searchParams.get('type')?.trim() || 'recovery') as EmailOtpType

    if (!tokenHash) {
      setPhase({
        kind: 'error',
        heading: 'Reset link unavailable',
        detail:
          'This password reset link is missing required information. Please return to PolarisPilot and request a new reset email.',
        canRetry: true,
      })
      return
    }

    let supabase: ReturnType<typeof createBrowserClient>
    try {
      supabase = createBrowserClient({ detectSessionInUrl: false })
      supabaseRef.current = supabase
    } catch {
      setPhase({
        kind: 'error',
        heading: 'Service unavailable',
        detail:
          'PolarisPilot is having trouble connecting right now. Please try again in a moment.',
        canRetry: true,
      })
      return
    }

    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

    if (error) {
      setPhase({
        kind: 'error',
        ...mapVerificationFailure(error.message),
      })
      return
    }

    setPhase({ kind: 'form' })
  }

  /* ── Phase 2: password update ─────────────────────────────────────────── */

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setFormError("Passwords don't match.")
      return
    }

    const supabase = supabaseRef.current
    if (!supabase) {
      setFormError('Session expired. Please request a new reset email.')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (error) {
      setFormError(
        normalizeAuthMessage(
          error.message,
          'Unable to update your password right now. Please try again.',
        ),
      )
      return
    }

    setPhase({ kind: 'done' })
  }

  /* ── Render ───────────────────────────────────────────────────────────── */

  if (phase.kind === 'verifying') return <VerifyingView />
  if (phase.kind === 'error')     return <ErrorView {...phase} />
  if (phase.kind === 'done')      return <DoneView />

  /* phase.kind === 'form' */
  return (
    <div className="animate-fade-up w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#E8F5F2] tracking-tight mb-2">
          Choose a new password
        </h1>
        <p className="text-sm text-[#6E9BAA]">
          Enter a new password for your PolarisPilot account.
        </p>
      </div>

      <div className="glass-card border-glow p-6 sm:p-8" style={{ borderRadius: '24px' }}>
        <form className="space-y-5" onSubmit={handleSubmit}>

          <div className="space-y-1.5">
            <label
              htmlFor="new-password"
              className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirm-password"
              className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="w-full h-12 rounded-xl font-bold text-sm text-[#070F15] mt-1 relative overflow-hidden group disabled:cursor-not-allowed disabled:opacity-80"
            style={{
              background: 'linear-gradient(135deg, #3DD6B0 0%, #2ABFA0 100%)',
              boxShadow: '0 4px 24px rgba(61,214,176,0.25)',
            }}
          >
            <span className="relative z-10">
              {submitting ? 'Updating...' : 'Update password'}
            </span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'linear-gradient(135deg, #5EE4C0 0%, #3DD6B0 100%)' }}
            />
          </button>

          {formError && (
            <p className="text-sm text-[#F6B6B6]" role="alert" aria-live="polite">
              {formError}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

/* ──────────────────────────── Sub-views ─────────────────────────────────── */

function VerifyingView() {
  return (
    <div className="flex max-w-xs flex-col items-center gap-6 text-center">
      <div className="relative h-16 w-16">
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full"
          aria-label="Verifying your reset link"
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
          <circle cx="32" cy="32" r="18" stroke="rgba(61,214,176,0.25)" strokeWidth="1" fill="none" />
          <path d="M32 32 L29.5 14 L32 18.5 L34.5 14 Z" fill="#3DD6B0" />
          <path d="M32 32 L30 50 L32 45.5 L34 50 Z" fill="rgba(61,214,176,0.3)" />
          <circle cx="32" cy="32" r="3" fill="#3DD6B0" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-[#E8F5F2]">Verifying your reset link...</p>
        <p className="mt-1.5 text-sm text-[#6E9BAA]">Just a moment.</p>
      </div>
    </div>
  )
}

function DoneView() {
  return (
    <div className="animate-fade-up flex max-w-sm flex-col items-center gap-6 text-center">
      <div className="relative">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(61,214,176,0.30)]"
          style={{
            background: 'radial-gradient(circle, rgba(61,214,176,0.14) 0%, rgba(61,214,176,0.04) 100%)',
            boxShadow: '0 0 40px rgba(61,214,176,0.14)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path d="M8 18l7 7 13-14" stroke="#3DD6B0" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-[rgba(61,214,176,0.15)] animate-ping"
          style={{ animationDuration: '2.5s' }}
        />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#E8F5F2]">Password updated</h1>
        <p className="leading-relaxed text-[#8CB4C0]">
          Your password has been changed successfully.
        </p>
        <p className="mt-1 text-sm text-[#6E9BAA]">
          Open PolarisPilot on your device and sign in with your new password.
        </p>
      </div>

      <p className="text-xs text-[#3E6474]">This browser tab can be safely closed.</p>
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
          background: 'radial-gradient(circle, rgba(255,80,80,0.10) 0%, rgba(255,80,80,0.03) 100%)',
        }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <path d="M17 11v8M17 22.5v.5" stroke="rgba(255,120,120,0.90)" strokeWidth="2.4" strokeLinecap="round" />
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
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              aria-hidden="true" className="mt-0.5 flex-shrink-0"
            >
              <circle cx="8" cy="8" r="7" stroke="rgba(61,214,176,0.40)" strokeWidth="1.2" />
              <path d="M8 5v4M8 11v.5" stroke="rgba(61,214,176,0.60)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <div className="space-y-1 text-xs text-[#6E9BAA]">
              <p className="font-semibold text-[#8CB4C0]">What to do next</p>
              <p>
                Open PolarisPilot on your device and request a new password reset email.
                Then tap the fresh link in your inbox.
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
