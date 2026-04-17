import type { Metadata } from 'next'
import LegalLayout from '@/components/LegalLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy — IncomePilot',
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
        IncomePilot (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the IncomePilot mobile
        application and website (together, the &quot;Services&quot;). This Privacy Policy
        explains what information we collect, why we collect it, how we use it,
        and your rights in relation to that information.
      </p>
      <p>
        By using IncomePilot you agree to the practices described in this policy.
        If you do not agree, please do not use the Services.
      </p>

      <h2>2. How IncomePilot Handles Your Data</h2>
      <p>
        <strong>IncomePilot is local-first by design.</strong> The earnings, shift
        logs, expenses, and work data you enter are stored on your device by
        default. This data does not leave your device unless you use features that
        require it to do so.
      </p>
      <p>
        <strong>Premium cloud-backed features.</strong> When you use premium
        cloud-backed features — such as cloud backup, cross-device restore, or
        connected premium experiences — eligible data may be securely transmitted
        to and stored on our infrastructure to support those features. This is done
        to protect your progress and enable restore and continuity. It is part of
        the premium experience, not a silent background process.
      </p>
      <p>
        In either case, your data belongs to you.
      </p>

      <h2>3. Information We Collect</h2>

      <h3>3.1 Account Information</h3>
      <p>
        When you create an account we collect your email address and any optional
        profile details you provide. Your password is hashed and never stored in
        plain text. Account information is stored on our authentication
        infrastructure regardless of your plan, as it is required to operate your
        account.
      </p>

      <h3>3.2 Work and Earnings Data</h3>
      <p>
        Shift logs, gig records, freelance entries, expenses, goals, and any other
        income data you enter are stored locally on your device by default.
      </p>
      <p>
        If you activate premium cloud-backed features, eligible earnings data may
        be securely backed up and synced to our cloud infrastructure to support
        backup, restore, and connected premium features. This is described in your
        in-app settings when those features are active.
      </p>

      <h3>3.3 Usage and Diagnostics</h3>
      <p>
        We collect anonymous usage events (such as which features are used) and
        crash reports to help us improve the app. These do not include the content
        of your earnings entries. We use industry-standard analytics and crash
        reporting tools for this purpose.
      </p>

      <h3>3.4 Device Information</h3>
      <p>
        We collect limited device information — such as device type and operating
        system version — to help diagnose compatibility issues and improve the app
        experience.
      </p>

      <h3>3.5 Communications</h3>
      <p>
        If you contact us for support, we retain the contents of that communication
        to help resolve your issue and improve our service.
      </p>

      <h2>4. How We Use Your Information</h2>
      <ul>
        <li>To provide, operate, and improve the Services</li>
        <li>To authenticate your account and keep it secure</li>
        <li>To deliver premium cloud-backed features where active, including backup, restore, and connected experiences</li>
        <li>To send transactional emails (e.g. email verification, password reset)</li>
        <li>To respond to support enquiries</li>
        <li>To detect and prevent fraud or abuse</li>
        <li>To comply with applicable legal obligations</li>
      </ul>
      <p>
        We do not sell your personal information. We do not use your earnings data
        for advertising.
      </p>

      <h2>5. Data Storage and Security</h2>
      <p>
        Local data lives on your device and is subject to your device&apos;s own
        security controls.
      </p>
      <p>
        Where data is transmitted to or stored on our infrastructure (for account
        authentication or premium cloud-backed features), it is processed using
        infrastructure provided by Supabase, hosted in Australia and/or the United
        States. Data in transit is protected by TLS encryption. Access to
        production systems is restricted to authorised personnel.
      </p>
      <p>
        No transmission or storage system is completely free of risk. We encourage
        you to use a strong, unique password and keep your device secure.
      </p>

      <h2>6. Data Retention</h2>

      <h3>6.1 Local data</h3>
      <p>
        Data stored locally on your device remains there until you delete the app
        or clear the app&apos;s data. Deleting the app does not delete your account or
        any cloud-backed data associated with it.
      </p>

      <h3>6.2 Account and cloud-backed data</h3>
      <p>
        We retain your account and any cloud-backed data for as long as your account
        is active. When you delete your account, we will delete or anonymise your
        personal data and any associated cloud-backed data within 30 days, except
        where we are required by law to retain it (for example, for fraud prevention
        or accounting obligations).
      </p>

      <h3>6.3 Communications data</h3>
      <p>
        Support communications are retained for a reasonable period to allow us to
        assist you and improve our service.
      </p>

      <h2>7. Sharing of Information</h2>
      <p>
        We share your information only to the extent necessary to provide the
        Services:
      </p>
      <ul>
        <li>
          <strong>Infrastructure providers</strong> — cloud hosting, authentication,
          and database services (including Supabase and Vercel) that process data on
          our behalf under data processing agreements.
        </li>
        <li>
          <strong>Subscription billing</strong> — subscription management is handled
          via the App Store (Apple), Google Play (Google), or RevenueCat. These
          providers process payment data under their own privacy policies. We do not
          receive or store full payment card details.
        </li>
        <li>
          <strong>Analytics providers</strong> — anonymous usage data only; no
          personal identifiers or earnings data are shared.
        </li>
        <li>
          <strong>Legal authorities</strong> — where required by law, court order, or
          to protect our rights or the safety of others.
        </li>
      </ul>

      <h2>8. Your Rights and Choices</h2>
      <p>
        Depending on your location, you may have rights regarding your personal
        information, including the right to:
      </p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your account and associated data</li>
        <li>Object to or restrict certain processing</li>
        <li>Request a portable export of your data</li>
      </ul>
      <p>
        <strong>In-app deletion</strong>: You can delete your account directly from
        the app&apos;s settings. This initiates deletion of your account and cloud-backed
        data within 30 days.
      </p>
      <p>
        <strong>Web requests</strong>: To exercise any of the above rights, contact
        us at{' '}
        <a href="mailto:privacy@incomepilot.app">privacy@incomepilot.app</a>.
        We will respond within 30 days.
      </p>

      <h2>9. Children&apos;s Privacy</h2>
      <p>
        IncomePilot is not directed to children under the age of 13. We do not
        knowingly collect personal information from children. If you believe a child
        has provided us with personal information, please contact us and we will
        promptly delete it.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        update the &quot;Last updated&quot; date at the top of this page. For significant
        changes we will notify you via the app or by email. Continued use of the
        Services after changes take effect constitutes your acceptance of the
        updated policy.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or how we handle your
        information:
      </p>
      <ul>
        <li>Privacy enquiries: <a href="mailto:privacy@incomepilot.app">privacy@incomepilot.app</a></li>
        <li>General: <a href="mailto:support@incomepilot.app">support@incomepilot.app</a></li>
        <li>Website: <a href="https://incomepilot.app">incomepilot.app</a></li>
      </ul>

    </LegalLayout>
  )
}
