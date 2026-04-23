'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setErrorMessage('Enter your email and password to sign in.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })

      if (error) {
        setErrorMessage(normalizeErrorMessage(error.message))
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? normalizeErrorMessage(err.message)
          : 'Unable to sign in right now. Please try again.',
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

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#8CB4C0] tracking-wide uppercase"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#4A8A9A] hover:text-[#3DD6B0] transition-colors underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full h-11 rounded-xl px-4 text-sm text-[#E8F5F2] placeholder-[#3E6474] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] focus:outline-none focus:border-[rgba(61,214,176,0.45)] focus:bg-[rgba(61,214,176,0.04)] transition-all duration-200"
          />
        </div>

        {/* Sign In button */}
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
          <span className="relative z-10">{loading ? 'Signing in...' : 'Sign In'}</span>
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

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
        <span className="text-xs text-[#3E6474] font-medium">or</span>
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
      </div>

      {/* Create account */}
      <p className="text-center text-sm text-[#6E9BAA]">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-semibold text-[#3DD6B0] hover:text-[#5EE4C0] transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}

function normalizeErrorMessage(message: string) {
  const cleanedMessage = message.replace(/^AuthApiError:\s*/i, '').trim()
  if (!cleanedMessage) {
    return 'Unable to sign in right now. Please try again.'
  }

  if (/fetch failed|network|timeout|timed out/i.test(cleanedMessage)) {
    return 'Unable to sign in right now. Please try again.'
  }

  return cleanedMessage
}
