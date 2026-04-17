'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { normalizeAuthMessage } from '@/lib/auth-helpers'

const INVALID_RECOVERY_MESSAGE =
  'This password reset link is invalid or has expired. Request a new password reset email and try again.'

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const recoveryType = searchParams.get('type')
  const hasRecoveryCode = searchParams.has('code')
  const [supabase] = useState(() => createClient())
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [initializing, setInitializing] = useState(true)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function initializeRecovery() {
      setInitializing(true)
      setErrorMessage('')

      const hasRecoveryHint =
        recoveryType === 'recovery' ||
        hasRecoveryCode ||
        (typeof window !== 'undefined' && window.location.hash.includes('type=recovery'))

      let sessionResponse = await supabase.auth.getSession()

      if (!sessionResponse.data.session && hasRecoveryHint) {
        await new Promise((resolve) => setTimeout(resolve, 150))
        sessionResponse = await supabase.auth.getSession()
      }

      if (!isMounted) return

      if (sessionResponse.error || !sessionResponse.data.session) {
        setReady(false)
        setInitializing(false)
        setErrorMessage(
          hasRecoveryHint
            ? INVALID_RECOVERY_MESSAGE
            : 'Open the password reset link from your email to choose a new password.',
        )
        return
      }

      setReady(true)
      setInitializing(false)
    }

    void initializeRecovery()

    return () => {
      isMounted = false
    }
  }, [hasRecoveryCode, recoveryType, supabase])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!ready) {
      setErrorMessage('Open the password reset link from your email to choose a new password.')
      return
    }

    if (!password || !confirmPassword) {
      setErrorMessage('Enter and confirm your new password.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Your passwords do not match yet.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setErrorMessage(
        normalizeAuthMessage(
          error.message,
          'Unable to update your password right now. Please try again.',
        ),
      )
      return
    }

    setReady(false)
    setPassword('')
    setConfirmPassword('')
    setSuccessMessage('Password updated successfully. You can sign in with your new password.')
  }

  return (
    <div
      className="glass-card border-glow p-6 sm:p-8"
      style={{ borderRadius: '24px' }}
    >
      {successMessage ? (
        <div className="space-y-6">
          <p className="text-sm text-[#8FE3CE]" aria-live="polite">
            {successMessage}
          </p>
          <Link
            href="/signin"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[rgba(61,214,176,0.28)] bg-[rgba(61,214,176,0.08)] px-4 text-sm font-semibold text-[#CFFCF2] transition-colors hover:bg-[rgba(61,214,176,0.14)]"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="reset-password"
              className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
            >
              New password
            </label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!ready || loading || initializing}
              className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="reset-confirm-password"
              className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
            >
              Confirm password
            </label>
            <input
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={!ready || loading || initializing}
              className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          <button
            type="submit"
            disabled={!ready || loading || initializing}
            aria-busy={loading}
            className="w-full h-12 rounded-xl font-bold text-sm text-[#070F15] mt-1 relative overflow-hidden group disabled:cursor-not-allowed disabled:opacity-80"
            style={{
              background: 'linear-gradient(135deg, #3DD6B0 0%, #2ABFA0 100%)',
              boxShadow: '0 4px 24px rgba(61,214,176,0.25)',
            }}
          >
            <span className="relative z-10">
              {initializing
                ? 'Checking reset link...'
                : loading
                  ? 'Updating password...'
                  : 'Update password'}
            </span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'linear-gradient(135deg, #5EE4C0 0%, #3DD6B0 100%)' }}
            />
          </button>

          {errorMessage ? (
            <p className="text-sm text-[#F6B6B6]" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          ) : null}
        </form>
      )}

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
        <span className="text-xs text-[#3E6474] font-medium">or</span>
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
      </div>

      <p className="text-center text-sm text-[#6E9BAA]">
        Need a new reset link?{' '}
        <Link
          href="/forgot-password"
          className="font-semibold text-[#3DD6B0] hover:text-[#5EE4C0] transition-colors"
        >
          Reset again
        </Link>
      </p>
    </div>
  )
}
