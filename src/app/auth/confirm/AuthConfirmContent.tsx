'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { buildAuthVerifiedDeepLink, createBrowserClient, tryOpenApp } from '@/lib/supabase'
import { mapVerificationFailure, resolveAuthConfirmParams } from '@/lib/auth-confirm'

type VerifyState =
  | { status: 'loading'; label: string }
  | { status: 'success'; appOpened: boolean; deepLink: string }
  | { status: 'error'; heading: string; detail: string; canRetry: boolean }

export default function AuthConfirmContent() {
  const searchParams = useSearchParams()
  const hasRun = useRef(false)
  const [state, setState] = useState<VerifyState>({
    status: 'loading',
    label: 'Checking your link…',
  })

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    void handleVerification()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleVerification() {
    const params = resolveAuthConfirmParams(searchParams)
    if (params.kind === 'invalid') {
      setState({ status: 'error', ...params })
      return
    }

    let supabase: ReturnType<typeof createBrowserClient>
    try {
      supabase = createBrowserClient({ detectSessionInUrl: params.kind === 'code' })
    } catch {
      setState({
        status: 'error',
        heading: 'Service unavailable',
        detail: 'IncomePilot is having trouble connecting right now. Please try again in a moment.',
        canRetry: true,
      })
      return
    }

    const verificationError =
      params.kind === 'code'
        ? (await supabase.auth.exchangeCodeForSession(params.code)).error
        : (
            await supabase.auth.verifyOtp({
              token_hash: params.tokenHash,
              type: params.otpType,
            })
          ).error

    if (verificationError) {
      setState({
        status: 'error',
        ...mapVerificationFailure(verificationError.message),
      })
      return
    }

    const deepLink = buildAuthVerifiedDeepLink(params.redirectTo)
    setState({
      status: 'loading',
      label: 'Verified successfully. Opening IncomePilot…',
    })

    await new Promise((resolve) => setTimeout(resolve, 350))
    const appOpened = await tryOpenApp(deepLink, 1600)
    setState({
      status: 'success',
      appOpened,
      deepLink,
    })
  }

  if (state.status === 'loading') {
    return <LoadingView label={state.label} />
  }

  if (state.status === 'error') {
    return (
      <ErrorView
        heading={state.heading}
        detail={state.detail}
        canRetry={state.canRetry}
      />
    )
  }

  return <SuccessView appOpened={state.appOpened} deepLink={state.deepLink} />
}

function LoadingView({ label }: { label: string }) {
  return (
    <div className="flex max-w-xs flex-col items-center gap-6 text-center">
      <div className="relative h-16 w-16">
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full"
          aria-label={label}
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
          <circle
            cx="32"
            cy="32"
            r="18"
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
        <p className="text-base font-semibold text-[#E8F5F2]">{label}</p>
        <p className="mt-1.5 text-sm text-[#6E9BAA]">Just a moment.</p>
      </div>
    </div>
  )
}

function SuccessView({
  appOpened,
  deepLink,
}: {
  appOpened: boolean
  deepLink: string
}) {
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
          Your email has been confirmed successfully.
        </p>
        <p className="mt-1 text-sm text-[#6E9BAA]">
          You can safely close this page and begin your IncomePilot journey in the app.
        </p>
      </div>

      <div className="glass-card mt-2 w-full p-4">
        {appOpened ? (
          <div className="flex items-start gap-3 text-left">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="mt-0.5 flex-shrink-0"
            >
              <circle cx="8" cy="8" r="7" stroke="#3DD6B0" strokeWidth="1.2" />
              <path
                d="M5.5 8l2 2 3-3.5"
                stroke="#3DD6B0"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-xs text-[#6E9BAA]">
              IncomePilot should be open on your device. If not, return to the app and sign in there.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="mt-0.5 flex-shrink-0"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="rgba(61,214,176,0.50)"
                  strokeWidth="1.2"
                />
                <path
                  d="M8 5v4M8 11v.5"
                  stroke="rgba(61,214,176,0.70)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-xs text-[#6E9BAA]">
                If IncomePilot does not open automatically, return to the app and sign in there.
              </p>
            </div>
            <a
              href={deepLink}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[rgba(61,214,176,0.28)] bg-[rgba(61,214,176,0.08)] px-4 text-sm font-semibold text-[#CFFCF2] transition-colors hover:bg-[rgba(61,214,176,0.14)]"
            >
              Open IncomePilot
            </a>
          </div>
        )}
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
                Open IncomePilot on your device and choose <em>Resend verification email</em> from
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
