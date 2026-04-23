'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getSiteUrl, normalizeAuthMessage } from '@/lib/auth-helpers'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrorMessage('Enter your email to receive a reset link.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: getSiteUrl('/auth/callback?next=/reset-password'),
      })

      if (error) {
        setErrorMessage(normalizeAuthMessage(error.message))
        return
      }

      setSuccessMessage('Password reset email sent. Check your inbox for the secure link.')
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? normalizeAuthMessage(err.message)
          : 'Unable to send reset email right now. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="glass-card border-glow p-6 sm:p-8"
      style={{ borderRadius: '24px' }}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label
            htmlFor="forgot-email"
            className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
          >
            Email address
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full h-12 rounded-xl font-bold text-sm text-[#070F15] mt-1 relative overflow-hidden group disabled:cursor-not-allowed disabled:opacity-80"
          style={{
            background: 'linear-gradient(135deg, #3DD6B0 0%, #2ABFA0 100%)',
            boxShadow: '0 4px 24px rgba(61,214,176,0.25)',
          }}
        >
          <span className="relative z-10">
            {loading ? 'Sending reset email...' : 'Send reset email'}
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

        {successMessage ? (
          <p className="text-sm text-[#8FE3CE]" aria-live="polite">
            {successMessage}
          </p>
        ) : null}
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
        <span className="text-xs text-[#3E6474] font-medium">or</span>
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
      </div>

      <p className="text-center text-sm text-[#6E9BAA]">
        Remembered your password?{' '}
        <Link
          href="/signin"
          className="font-semibold text-[#3DD6B0] hover:text-[#5EE4C0] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
