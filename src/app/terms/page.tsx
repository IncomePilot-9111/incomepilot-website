import type { Metadata } from 'next'
import LegalLayout from '@/components/LegalLayout'

export const metadata: Metadata = {
  title: 'Terms of Use — IncomePilot',
  description: 'The terms and conditions governing your use of IncomePilot.',
}

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Use"
      subtitle="Please read these terms carefully before using IncomePilot."
      lastUpdated="April 2025"
    >

      <h2>1. Acceptance of Terms</h2>
      <p>
        By downloading, installing, or using the IncomePilot application or
        website (the &quot;Services&quot;), you agree to be bound by these Terms of Use
        (&quot;Terms&quot;). If you do not agree, do not use the Services.
      </p>
      <p>
        These Terms form a legally binding agreement between you and IncomePilot
        (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 13 years of age to use IncomePilot. By creating an
        account you confirm that you meet this requirement. If you use IncomePilot
        on behalf of an organisation, you represent that you have authority to bind
        that organisation to these Terms.
      </p>

      <h2>3. Description of Services</h2>
      <p>
        IncomePilot is a personal earnings intelligence application designed for
        people who earn through one or more income streams — including shift work,
        freelance, delivery, rideshare, rentals, and more. The Services allow you
        to log earnings, track expenses, set goals, view summaries, and access
        intelligence features powered by CompassInsightEngine.
      </p>
      <p>
        <strong>IncomePilot is not a financial advisory, accounting, tax, or legal
        service.</strong> Nothing in the Services constitutes financial, investment,
        tax, legal, or professional advice. Always consult a qualified professional
        for advice specific to your circumstances.
      </p>
      <p>
        <strong>Local-first by default.</strong> IncomePilot stores your earnings
        and work data on your device by default. Premium features may involve
        secure cloud backup, restore, and sync as described in Section 7.
      </p>

      <h2>4. Accounts and Security</h2>
      <p>To access the full functionality of IncomePilot you must create an account. You agree to:</p>
      <ul>
        <li>Provide accurate and complete registration information</li>
        <li>Keep your password secure and not share it with others</li>
        <li>Notify us promptly of any unauthorised access to your account at <a href="mailto:support@incomepilot.app">support@incomepilot.app</a></li>
        <li>Accept responsibility for all activity that occurs under your account</li>
      </ul>
      <p>
        We reserve the right to suspend accounts where we reasonably suspect
        unauthorised access, fraudulent activity, or breach of these Terms.
      </p>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Services for any unlawful purpose</li>
        <li>Reverse engineer, decompile, disassemble, or attempt to extract the source code of any part of the Services</li>
        <li>Attempt to gain unauthorised access to any part of the Services or our infrastructure</li>
        <li>Transmit viruses, malware, or any harmful or disruptive code</li>
        <li>Scrape, crawl, or extract data from the Services by automated means without our written permission</li>
        <li>Impersonate any person or entity, or misrepresent your identity or affiliation</li>
        <li>Use the Services in a way that could damage, disable, overburden, or impair them</li>
        <li>Circumvent, disable, or interfere with security-related features of the Services</li>
      </ul>

      <h2>6. Your Data and Content</h2>
      <p>
        You retain full ownership of the earnings, expense, and work data you enter
        into IncomePilot. By using the Services you grant us a limited, non-exclusive,
        royalty-free licence to store, process, and display that data solely for the
        purpose of providing the Services to you.
      </p>
      <p>
        This licence does not allow us to sell your data, use it for advertising, or
        share it with third parties except as described in our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>
      <p>
        You are responsible for the accuracy of the information you enter. IncomePilot
        processes and presents your data based on what you provide.
      </p>

      <h2>7. Local-First Services and Premium Cloud-Backed Features</h2>
      <p>
        <strong>Local-first default.</strong> IncomePilot is built so that your
        earnings and work data lives on your device by default. The core app
        functions locally and does not require cloud infrastructure for standard
        personal use.
      </p>
      <p>
        <strong>Premium cloud-backed features.</strong> Premium unlocks optional
        cloud-backed functionality including secure cloud backup, cross-device
        restore, sync, and connected premium experiences. When those features are
        active and eligible, data may be securely transmitted to and stored on
        IncomePilot&apos;s cloud infrastructure to support backup, continuity, and
        restore.
      </p>
      <p>
        Premium cloud-backed features depend on network connectivity and third-party
        infrastructure. We do not warrant uninterrupted or error-free operation of
        these features. You remain responsible for maintaining any local backups you
        wish to keep independently.
      </p>

      <h2>8. Paid Features, Subscriptions, and Billing</h2>
      <p>
        IncomePilot may offer premium features through a paid subscription.
        Subscriptions are billed through the platform you use to purchase them —
        the Apple App Store or Google Play Store. Subscription management, billing
        cycles, and refund entitlements for platform purchases are governed by
        Apple&apos;s or Google&apos;s terms and policies, not by IncomePilot directly.
      </p>
      <p>
        Where purchases are made directly through IncomePilot (outside a platform
        store), we will describe billing terms clearly at the point of purchase.
      </p>
      <p>
        Subscriptions automatically renew unless cancelled before the renewal date.
        To cancel, manage your subscription through your device&apos;s App Store or
        Google Play account settings. We do not offer refunds for partial
        subscription periods unless required by applicable law.
      </p>
      <p>
        We reserve the right to change our pricing or feature tiers with reasonable
        notice. Continued use after a price change takes effect constitutes
        acceptance of the new pricing.
      </p>

      <h2>9. Third-Party Services</h2>
      <p>
        IncomePilot uses third-party services to operate. These may include
        authentication and cloud infrastructure (Supabase), hosting (Vercel), and
        subscription management (RevenueCat, Apple, Google). Your use of these
        services is also subject to their respective terms and privacy policies.
        We are not responsible for the practices of third-party providers.
      </p>

      <h2>10. No Financial, Tax, Legal, or Professional Advice</h2>
      <p>
        IncomePilot is a personal productivity and intelligence tool. The
        calculations, forecasts, summaries, tax estimates, goal projections, and
        insights it provides are based on the data you enter and are for
        informational and planning purposes only.
      </p>
      <p>
        Nothing in IncomePilot constitutes financial advice, tax advice, legal advice,
        accounting advice, or investment advice. IncomePilot does not replace a
        qualified accountant, financial adviser, or tax professional. Always verify
        important financial or tax figures with an appropriate professional before
        acting on them.
      </p>

      <h2>11. Accuracy and User Responsibility</h2>
      <p>
        The accuracy of IncomePilot&apos;s calculations, summaries, and estimates depends
        entirely on the accuracy and completeness of the information you enter. We
        make no warranty that results are correct, complete, or appropriate for any
        particular purpose. You are solely responsible for reviewing and verifying
        figures that matter — particularly for tax, reporting, or financial
        decision-making purposes.
      </p>

      <h2>12. Service Availability and Changes</h2>
      <p>
        We aim to keep IncomePilot available and functioning well, but we do not
        warrant uninterrupted or error-free access to the Services. We may modify,
        suspend, or discontinue any part of the Services at any time, with or
        without notice. Where we make material changes that affect you, we will
        endeavour to notify you via the app or email.
      </p>
      <p>
        Cloud-backed premium features depend on network access and third-party
        infrastructure availability. Temporary unavailability of cloud features does
        not affect local data on your device.
      </p>

      <h2>13. Intellectual Property</h2>
      <p>
        The Services — including all software, design, branding, CompassInsightEngine,
        and content — are owned by IncomePilot and protected by applicable
        intellectual property laws. Nothing in these Terms grants you any right to
        use our trademarks, logos, or brand elements without our prior written
        consent.
      </p>

      <h2>14. Suspension and Termination</h2>
      <p>
        We may suspend or terminate your access to the Services if we reasonably
        believe you have violated these Terms, engaged in fraudulent or harmful
        conduct, or for any other legitimate operational reason. Where possible, we
        will provide notice before taking action.
      </p>
      <p>
        You may delete your account at any time from within the app settings or
        by contacting{' '}
        <a href="mailto:privacy@incomepilot.app">privacy@incomepilot.app</a>.
        Upon deletion, your account and associated cloud-backed data will be removed
        in accordance with our <a href="/privacy">Privacy Policy</a>.
      </p>
      <p>
        Deleting the app from your device does not delete your account. Account
        deletion must be initiated in-app or by written request.
      </p>

      <h2>15. Disclaimers</h2>
      <p>
        THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES
        OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND
        NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE
        UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
      </p>
      <p>
        FORECASTS, PREDICTIONS, AND INSIGHTS GENERATED BY INCOMEPILOT ARE
        ESTIMATES BASED ON USER-PROVIDED DATA. THEY ARE NOT GUARANTEED TO BE
        ACCURATE AND SHOULD NOT BE RELIED ON AS A SUBSTITUTE FOR PROFESSIONAL
        FINANCIAL ADVICE.
      </p>

      <h2>16. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, INCOMEPILOT SHALL NOT
        BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
        DAMAGES — INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS — ARISING
        OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICES OR THESE TERMS, EVEN
        IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE
        SERVICES SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT PAID BY YOU TO
        INCOMEPILOT IN THE TWELVE MONTHS IMMEDIATELY PRECEDING THE CLAIM; OR (B)
        AUD $50.
      </p>
      <p>
        SOME JURISDICTIONS DO NOT ALLOW CERTAIN EXCLUSIONS OR LIMITATIONS OF
        LIABILITY. WHERE MANDATORY CONSUMER LAWS APPLY TO YOU, THOSE LAWS WILL TAKE
        PRECEDENCE OVER THE ABOVE LIMITATIONS TO THE EXTENT REQUIRED.
      </p>

      <h2>17. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the State of Victoria, Australia,
        without regard to conflict of law principles. Any disputes arising under
        these Terms shall be subject to the non-exclusive jurisdiction of the courts
        of Victoria, Australia.
      </p>

      <h2>18. Changes to Terms</h2>
      <p>
        We may revise these Terms at any time. When we do, we will update the
        &quot;Last updated&quot; date. Your continued use of the Services after changes take
        effect constitutes your acceptance of the revised Terms. For material changes
        we will provide notice via the app or by email where practicable.
      </p>

      <h2>19. Contact</h2>
      <p>
        For questions about these Terms:
      </p>
      <ul>
        <li>Email: <a href="mailto:legal@incomepilot.app">legal@incomepilot.app</a></li>
        <li>General support: <a href="mailto:support@incomepilot.app">support@incomepilot.app</a></li>
        <li>Website: <a href="https://incomepilot.app">incomepilot.app</a></li>
      </ul>

    </LegalLayout>
  )
}
