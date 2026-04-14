import type { Metadata } from 'next'
import LegalLayout from '@/components/LegalLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How IncomePilot collects, uses, and protects your information.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your information."
      lastUpdated="April 2025"
    >

      <h2>1. About this Policy</h2>
      <p>
        IncomePilot (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy of the
        people who use our mobile application and website (together, the &quot;Services&quot;).
        This Privacy Policy explains what personal information we collect, why we
        collect it, how we use it, and your rights regarding that information.
      </p>
      <p>
        By using IncomePilot you agree to the collection and use of information in
        accordance with this policy. If you do not agree, please do not use the
        Services.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Account Information</h3>
      <p>
        When you create an account we collect your email address and any optional
        profile details you provide (such as a display name). Your password is
        hashed and never stored in plain text.
      </p>

      <h3>2.2 Income and Work Data</h3>
      <p>
        The core purpose of IncomePilot is to help you track your earnings and work
        sessions. All shift logs, gig job records, freelance entries, expenses, and
        goal data you enter are stored securely on our servers so they can be synced
        across your devices. This data belongs to you.
      </p>

      <h3>2.3 Usage and Crash Data</h3>
      <p>
        We collect anonymous usage events (e.g. which features are used) and crash
        reports to help us improve the app. These events do not include the content
        of your income entries. We use industry-standard analytics and crash
        reporting tools for this purpose.
      </p>

      <h3>2.4 Device Information</h3>
      <p>
        We collect limited device information (device type, operating system
        version) to help diagnose compatibility issues and optimise the app
        experience.
      </p>

      <h3>2.5 Communications</h3>
      <p>
        If you contact us for support we will retain the contents of that
        communication to help resolve your issue.
      </p>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To provide, maintain, and improve the Services</li>
        <li>To authenticate your account and keep it secure</li>
        <li>To sync your data across devices</li>
        <li>To send transactional emails (e.g. email verification, password reset)</li>
        <li>To respond to support enquiries</li>
        <li>To detect and prevent fraud or abuse</li>
        <li>To comply with legal obligations</li>
      </ul>
      <p>
        We do not sell your personal information to third parties. We do not use
        your income data for advertising purposes.
      </p>

      <h2>4. Data Storage and Security</h2>
      <p>
        Your data is stored on servers provided by Supabase, hosted on infrastructure
        in Australia and/or the United States. We use industry-standard encryption
        in transit (TLS) and at rest. Access to production databases is restricted
        to authorised personnel only.
      </p>
      <p>
        While we take reasonable steps to protect your information, no method of
        transmission or storage is 100% secure. We encourage you to use a strong,
        unique password for your account.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We retain your account and income data for as long as your account is active.
        If you delete your account, we will delete or anonymise your personal data
        within 30 days, except where we are required by law to retain it.
      </p>

      <h2>6. Sharing of Information</h2>
      <p>
        We share your information only with the following categories of third
        parties, and only to the extent necessary to provide the Services:
      </p>
      <ul>
        <li>
          <strong>Infrastructure providers</strong> — cloud hosting, database, and storage
          services (e.g. Supabase, Vercel) that process data on our behalf under
          data processing agreements.
        </li>
        <li>
          <strong>Analytics providers</strong> — anonymous usage data only; no personal
          identifiers or income data are shared.
        </li>
        <li>
          <strong>Legal authorities</strong> — where required by law, court order, or
          to protect our rights.
        </li>
      </ul>

      <h2>7. Your Rights</h2>
      <p>
        Depending on your location you may have rights regarding your personal
        information, including the right to:
      </p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your account and data</li>
        <li>Object to or restrict certain processing</li>
        <li>Export your data in a portable format</li>
      </ul>
      <p>
        To exercise any of these rights, please contact us at{' '}
        <a href="mailto:privacy@incomepilot.app">privacy@incomepilot.app</a>.
        We will respond within 30 days.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        IncomePilot is not directed to children under the age of 13. We do not
        knowingly collect personal information from children. If you believe a
        child has provided us with personal information, please contact us and
        we will promptly delete it.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        update the &quot;Last updated&quot; date at the top of this page. For significant
        changes we will notify you via the app or by email. Continued use of the
        Services after changes take effect constitutes your acceptance of the
        updated policy.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or how we handle your
        information, please contact us:
      </p>
      <ul>
        <li>Email: <a href="mailto:privacy@incomepilot.app">privacy@incomepilot.app</a></li>
        <li>Website: <a href="https://incomepilot.app">incomepilot.app</a></li>
      </ul>

    </LegalLayout>
  )
}
