import type { Metadata } from 'next'
import Link from 'next/link'
import AuthPageShell from '@/components/AuthPageShell'
import SignUpForm from './SignUpForm'

export const metadata: Metadata = {
  title: 'Sign Up — IncomePilot',
  description: 'Create your IncomePilot account.',
  robots: { index: false, follow: false },
}

export default function SignUpPage() {
  return (
    <AuthPageShell
      title="Create your account"
      subtitle="Start using IncomePilot with email and password"
      finePrint={
        <>
          By creating an account you agree to our{' '}
          <Link
            href="/terms"
            className="hover:text-[#3DD6B0] transition-colors underline underline-offset-2"
          >
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="hover:text-[#3DD6B0] transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          . Your data stays on your device by default. Premium unlocks secure cloud backup.
        </>
      }
    >
      <SignUpForm />
    </AuthPageShell>
  )
}
