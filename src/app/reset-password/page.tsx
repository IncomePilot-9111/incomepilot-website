import { Suspense } from 'react'
import type { Metadata } from 'next'
import AuthPageShell from '@/components/AuthPageShell'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Choose a new password for your PolarisPilot account.',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="Choose a new password"
      subtitle="Enter a new password for your PolarisPilot account"
    >
      <Suspense fallback={<ResetPasswordLoadingState />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  )
}

function ResetPasswordLoadingState() {
  return (
    <div
      className="glass-card border-glow p-6 sm:p-8"
      style={{ borderRadius: '24px' }}
    >
      <p className="text-sm text-[#8CB4C0]">Checking your reset link…</p>
    </div>
  )
}
