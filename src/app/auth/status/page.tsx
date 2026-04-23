import type { Metadata } from 'next'
import Link from 'next/link'
import AuthPageShell from '@/components/AuthPageShell'

type AuthStatusPageProps = {
  searchParams?: {
    type?: string
  }
}

const statusContent = {
  confirmed: {
    title: 'Email confirmed',
    detail: 'Your email has been confirmed successfully. You can continue into PolarisPilot.',
    actionHref: '/dashboard',
    actionLabel: 'Go to dashboard',
  },
  success: {
    title: 'Signed in successfully',
    detail: 'Your account is connected and ready to continue.',
    actionHref: '/dashboard',
    actionLabel: 'Continue',
  },
  error: {
    title: 'We could not complete that sign-in',
    detail:
      'The callback link could not be completed safely. Please try signing in again or request a fresh email link.',
    actionHref: '/signin',
    actionLabel: 'Back to sign in',
  },
  'invalid-link': {
    title: 'This link is invalid',
    detail:
      'This auth link is missing required information or has expired. Please request a fresh link and try again.',
    actionHref: '/signin',
    actionLabel: 'Return to sign in',
  },
} as const

export const metadata: Metadata = {
  title: 'Auth Status',
  description: 'Valkoda authentication status.',
  robots: { index: false, follow: false },
}

export default function AuthStatusPage({ searchParams }: AuthStatusPageProps) {
  const type = searchParams?.type === 'success' ||
    searchParams?.type === 'confirmed' ||
    searchParams?.type === 'error' ||
    searchParams?.type === 'invalid-link'
    ? searchParams.type
    : 'error'

  const content = statusContent[type]

  return (
    <AuthPageShell title={content.title} subtitle="PolarisPilot account access">
      <div
        className="glass-card border-glow p-6 sm:p-8"
        style={{ borderRadius: '24px' }}
      >
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-[#8CB4C0]">{content.detail}</p>

          <Link
            href={content.actionHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[rgba(61,214,176,0.28)] bg-[rgba(61,214,176,0.08)] px-4 text-sm font-semibold text-[#CFFCF2] transition-colors hover:bg-[rgba(61,214,176,0.14)]"
          >
            {content.actionLabel}
          </Link>
        </div>
      </div>
    </AuthPageShell>
  )
}
