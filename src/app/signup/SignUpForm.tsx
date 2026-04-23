'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSiteUrl, normalizeAuthMessage } from '@/lib/auth-helpers'

export default function SignUpForm() {
  const router = useRouter()
  const [displayName, setDisplayName]       = useState('')
  const [email, setEmail]                   = useState('')
  const [password, setPassword]             = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]               = useState(false)
  const [errorMessage, setErrorMessage]     = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    // Client-side validation
    const trimmedName  = displayName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setErrorMessage('Enter a display name for your account.')
      return
    }
    if (!trimmedEmail || !password || !confirmPassword) {
      setErrorMessage('Enter your email and password to create your account.')
      return
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMessage('Your passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          // display_name stored in auth.users.raw_user_meta_data
          // The DB trigger copies this into public.profiles on insert.
          data: { display_name: trimmedName },
          emailRedirectTo: getSiteUrl('/auth/callback?next=/dashboard'),
        },
      })

      if (error) {
        setErrorMessage(normalizeAuthMessage(error.message))
        return
      }

      setPassword('')
      setConfirmPassword('')

      if (data.session) {
        // Email confirmation is disabled in Supabase - session granted immediately
        router.push('/dashboard')
        router.refresh()
        return
      }

      // Email confirmation is enabled - tell the user to check their inbox
      setSuccessMessage(
        'Almost there! Check your inbox and click the confirmation link to activate your account.',
      )
    } catch (err) {
      // Catches createClient() throwing (missing env vars) or unexpected errors
      setErrorMessage(
        err instanceof Error
          ? normalizeAuthMessage(err.message)
          : 'Something went wrong. Please check your connection and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  // If success, replace the form with a clean confirmation state
  if (successMessage) {
    return (
      <div
        className="glass-card border-glow p-6 sm:p-8 text-center space-y-4"
        style={{ borderRadius: '24px' }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'rgba(61,214,176,0.12)', border: '1px solid rgba(61,214,176,0.3)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke="#3DD6B0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#F5F7FB]">Check your inbox</h2>
        <p className="text-sm text-[#8CB4C0] leading-relaxed">{successMessage}</p>
        <p className="text-xs text-[#4A7A8A]">
          Didn&apos;t receive it?{' '}
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-[#3DD6B0] hover:text-[#5EE4C0] underline underline-offset-2 transition-colors"
          >
            Try again
          </button>
        </p>
      </div>
    )
  }

  return (
    <div
      className="glass-card border-glow p-6 sm:p-8"
      style={{ borderRadius: '24px' }}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>

        {/* Display name */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-display-name"
            className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
          >
            Display name
          </label>
          <input
            id="signup-display-name"
            type="text"
            autoComplete="name"
            placeholder="How should we call you?"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
            className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200 disabled:opacity-60"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
          >
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200 disabled:opacity-60"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200 disabled:opacity-60"
          />
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm-password"
            className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
          >
            Confirm password
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200 disabled:opacity-60"
          />
        </div>

        {/* Error */}
        {errorMessage ? (
          <p className="text-sm text-[#F6B6B6]" role="alert" aria-live="polite">
            {errorMessage}
          </p>
        ) : null}

        {/* Submit */}
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
            {loading ? 'Creating account...' : 'Create account'}
          </span>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'linear-gradient(135deg, #5EE4C0 0%, #3DD6B0 100%)' }}
          />
        </button>

      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
        <span className="text-xs text-[#3E6474] font-medium">or</span>
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
      </div>

      <p className="text-center text-sm text-[#6E9BAA]">
        Already have an account?{' '}
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
