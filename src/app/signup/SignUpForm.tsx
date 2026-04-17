'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSiteUrl, normalizeAuthMessage } from '@/lib/auth-helpers'

export default function SignUpForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password || !confirmPassword) {
      setErrorMessage('Enter your email and password to create your account.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Your passwords do not match yet.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: getSiteUrl('/auth/callback?next=/dashboard'),
      },
    })

    if (error) {
      setLoading(false)
      setErrorMessage(normalizeAuthMessage(error.message))
      return
    }

    setLoading(false)
    setPassword('')
    setConfirmPassword('')

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    setSuccessMessage('Check your email to confirm your account.')
  }

  return (
    <div
      className="glass-card border-glow p-6 sm:p-8"
      style={{ borderRadius: '24px' }}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
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
            onChange={(event) => setEmail(event.target.value)}
            className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200"
          />
        </div>

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
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200"
          />
        </div>

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
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          <span className="relative z-10">{loading ? 'Creating account...' : 'Create account'}</span>
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
