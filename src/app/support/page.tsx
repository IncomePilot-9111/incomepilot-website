import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with IncomePilot.',
}

const topics = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    title:  'Account & Sign-in',
    detail: 'Trouble signing in, verifying your email, or managing your account.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title:  'App Features',
    detail: 'Questions about shift logging, freelance, gig jobs, goals, or Compass insights.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title:  'Data & Export',
    detail: 'Exporting reports, understanding tax summaries, or moving your data.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title:  'Privacy & Data Removal',
    detail: 'Requests to delete your account or data, or questions about how we store information.',
  },
]

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />

      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-80"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(61,214,176,0.06) 0%, transparent 70%)',
        }}
      />

      <main className="flex-1 relative">
        <div className="section-container pt-14 pb-24 max-w-2xl">

          {/* Header */}
          <div className="mb-12">
            <p className="section-eyebrow">Help centre</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#E8F5F2] mb-3">
              How can we help?
            </h1>
            <p className="text-[#6E9BAA] text-base leading-relaxed">
              IncomePilot support is here for you. Choose a topic below or send
              us a message and we&apos;ll get back to you as quickly as we can.
            </p>
          </div>

          {/* Topic cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
            {topics.map((t) => (
              <div key={t.title} className="glass-card p-5 flex gap-4">
                <div className="feature-icon w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-[rgba(61,214,176,0.10)] text-[#3DD6B0] border border-[rgba(61,214,176,0.18)]">
                  {t.icon}
                </div>
                <div>
                  <h2 className="font-semibold text-[#E8F5F2] text-sm mb-1">{t.title}</h2>
                  <p className="text-xs text-[#6E9BAA] leading-relaxed">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <hr className="divider mb-10" />

          {/* Contact section */}
          <div>
            <h2 className="text-xl font-bold text-[#E8F5F2] mb-2">Contact us</h2>
            <p className="text-[#6E9BAA] text-sm mb-7 leading-relaxed">
              We are a small team and we read every message. Email is the fastest
              way to reach us.
            </p>

            <ContactCard
              label="General support"
              email="support@incomepilot.app"
              detail="Questions, feedback, feature requests, or anything else."
            />
            <ContactCard
              label="Privacy & data requests"
              email="privacy@incomepilot.app"
              detail="Account deletion, data export, or privacy enquiries."
            />
            <ContactCard
              label="Legal & terms"
              email="legal@incomepilot.app"
              detail="Partnership, licensing, or legal correspondence."
            />
          </div>

          <hr className="divider my-10" />

          {/* Auth / verification FAQ */}
          <div>
            <h2 className="text-xl font-bold text-[#E8F5F2] mb-6">
              Common questions
            </h2>

            <FaqItem
              question="My verification email link isn't working."
              answer="Verification links expire after a short time. Open IncomePilot on your device and select 'Resend verification email' from the sign-in screen, then tap the fresh link in your inbox within a few minutes."
            />
            <FaqItem
              question="I verified my email on my computer but the app isn't signed in."
              answer="When you verify on a different device, the app won't automatically open. Simply return to the IncomePilot app on your phone and sign in with your email and password — your account is now active."
            />
            <FaqItem
              question="How do I delete my account and data?"
              answer="You can delete your account from the app's settings screen. Alternatively, email privacy@incomepilot.app and we will process the deletion within 30 days."
            />
            <FaqItem
              question="Is IncomePilot available yet?"
              answer="IncomePilot is currently in final development. iOS and Android apps are launching soon. Follow us to be notified when they're live."
            />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────── */

function ContactCard({
  label,
  email,
  detail,
}: {
  label: string
  email: string
  detail: string
}) {
  return (
    <a
      href={`mailto:${email}`}
      className="flex items-start gap-4 p-5 glass-card glass-card-hover mb-3 group"
    >
      {/* Mail icon */}
      <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-[rgba(61,214,176,0.10)] border border-[rgba(61,214,176,0.18)] flex items-center justify-center text-[#3DD6B0]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#4A7A8A] font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-[#3DD6B0] group-hover:text-[#5EE4C0] transition-colors truncate">
          {email}
        </p>
        <p className="text-xs text-[#6E9BAA] mt-0.5">{detail}</p>
      </div>

      {/* Arrow */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="flex-shrink-0 mt-1 text-[#3E6474] group-hover:text-[#3DD6B0] transition-colors"
      >
        <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </a>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group mb-3">
      <summary className="flex items-center justify-between cursor-pointer list-none p-4 glass-card rounded-ip hover:border-[rgba(61,214,176,0.20)] transition-colors">
        <span className="text-sm font-semibold text-[#C8EDE5] pr-4">{question}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="flex-shrink-0 text-[#4A7A8A] transition-transform duration-200 group-open:rotate-180"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </summary>
      <div className="px-4 pt-3 pb-4 text-sm text-[#6E9BAA] leading-relaxed border-t border-[rgba(255,255,255,0.05)] -mt-[1px] glass-card rounded-t-none rounded-b-ip">
        {answer}
      </div>
    </details>
  )
}
