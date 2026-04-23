import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get help with Valkoda and PolarisPilot. Account, product, data, and privacy support.',
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
    detail: 'Trouble signing in, verifying your email, resetting your password, or managing your account.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title:  'App Features',
    detail: 'Questions about PolarisPilot modules, goals, account access, or intelligent earnings guidance.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title:  'Data & Export',
    detail: 'Exporting reports, understanding summaries, local vs cloud-backed data, or moving your data.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title:  'Privacy & Data Removal',
    detail: 'Requests to delete your account or data, or questions about how Valkoda stores and protects your information.',
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
            <p className="section-eyebrow">Contact</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#E8F5F2] mb-3">
              Talk to <span className="brand-wordmark text-[0.72em] sm:text-[0.74em] text-[#E8F5F2]">Valkoda</span>
            </h1>
            <p className="text-[#6E9BAA] text-base leading-relaxed">
              We read every message. Choose a topic below or contact us directly
              about PolarisPilot, account access, privacy, or product questions.
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
              Email is the fastest way to reach us. We aim to respond within
              2–3 business days, though it may take longer during busy periods.
            </p>

            <ContactCard
              label="General support"
              email="support@valkoda.app"
              detail="Questions, feedback, feature requests, or anything else."
            />
            <ContactCard
              label="Privacy & data requests"
              email="privacy@valkoda.app"
              detail="Account deletion, data export, or privacy enquiries."
            />
            <ContactCard
              label="Legal & terms"
              email="legal@valkoda.app"
              detail="Partnership, licensing, or legal correspondence."
            />
          </div>

          <hr className="divider my-10" />

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold text-[#E8F5F2] mb-6">
              Common questions
            </h2>

            <FaqItem
              question="My verification email link isn't working."
              answer="Verification links expire after a short period for security. Go back to the PolarisPilot sign-in screen, select 'Resend verification email', and then tap the new link in your inbox within a few minutes of receiving it. If you continue to have trouble, contact support@valkoda.app."
            />
            <FaqItem
              question="I verified my email on my computer but the app still shows as unverified."
              answer="Verifying on a different device doesn't automatically sign in the app. Return to PolarisPilot on your phone and sign in with your email and password - your account is now active and the app will reflect that once you sign in."
            />
            <FaqItem
              question="How do I delete my account and data?"
              answer="You can delete your account directly from the app's settings screen. This will remove your account and any cloud-backed data associated with it within 30 days. Data stored locally on your device is removed when you delete the app. If you prefer to submit a deletion request in writing, email privacy@valkoda.app. Note: deleting the app from your device does not delete your account."
            />
            <FaqItem
              question="What happens to my local data if I delete the app?"
              answer="Deleting the app removes the local data stored on your device. However, it does not delete your account or any cloud-backed data associated with a premium subscription. To fully delete your account and all associated data, use the in-app account deletion option in settings, or contact privacy@valkoda.app."
            />
            <FaqItem
              question="How do I access PolarisPilot?"
              answer="PolarisPilot is being introduced through Pioneer Alpha early access. Use the website sign-up flow to request access and stay aligned with the next product milestones."
            />
            <FaqItem
              question="Does PolarisPilot store my earnings data on a server?"
              answer="By default, your earnings and work data is stored locally on your device - not on our servers. If you use premium cloud-backed features (such as cloud backup or cross-device restore), eligible data may be securely backed up to our infrastructure to support those features. This is described clearly in your in-app settings when those features are active."
            />
            <FaqItem
              question="Can I export my data?"
              answer="Yes. PolarisPilot supports data export from within the app. For formal data portability requests, contact privacy@valkoda.app and we will respond within 30 days."
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
