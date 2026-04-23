import type { Metadata } from 'next'
import AuthPageShell from '@/components/AuthPageShell'
import ForgotPasswordForm from './ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset email for your PolarisPilot account.',
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Reset your password"
      subtitle="We&apos;ll send you a secure reset link"
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  )
}
