import type { Metadata } from 'next'
import LegalLayout from '@/components/LegalLayout'

export const metadata: Metadata = {
  title: 'Terms of Use',
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
        (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Services.
      </p>
      <p>
        These Terms constitute a legally binding agreement between you and
        IncomePilot (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
      </p>

      <h2>2. Description of Services</h2>
      <p>
        IncomePilot is an income tracking and financial planning application
        designed for shift workers, gig economy workers, and freelancers. The
        Services allow you to log earnings, track expenses, set income goals,
        and review financial summaries.
      </p>
      <p>
        IncomePilot is a personal productivity tool. It is not a financial
        advisory service, accounting service, or tax advice service. Nothing in
        the Services constitutes financial, tax, legal, or professional advice.
      </p>

      <h2>3. Accounts and Registration</h2>
      <p>
        To access the full functionality of IncomePilot you must create an
        account. You agree to:
      </p>
      <ul>
        <li>Provide accurate and complete registration information</li>
        <li>Maintain the security of your password</li>
        <li>Promptly notify us of any unauthorised access to your account</li>
        <li>Accept responsibility for all activity that occurs under your account</li>
      </ul>
      <p>
        You must be at least 13 years of age to create an account. By creating an
        account you represent that you meet this requirement.
      </p>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Services for any unlawful purpose</li>
        <li>Reverse engineer, decompile, or disassemble any part of the Services</li>
        <li>Attempt to gain unauthorised access to any part of the Services or infrastructure</li>
        <li>Transmit viruses, malware, or other harmful code</li>
        <li>Scrape, crawl, or extract data from the Services by automated means</li>
        <li>Impersonate any person or entity</li>
        <li>Use the Services in a way that could damage, disable, or impair them</li>
      </ul>

      <h2>5. Your Data</h2>
      <p>
        You retain ownership of the income, expense, and work data you enter into
        IncomePilot. By using the Services you grant us a limited licence to store,
        process, and display that data solely for the purpose of providing the
        Services to you.
      </p>
      <p>
        We take reasonable steps to safeguard your data. Please see our{' '}
        <a href="/privacy">Privacy Policy</a> for full details.
      </p>

      <h2>6. Accuracy of Information</h2>
      <p>
        The calculations, summaries, tax estimates, and insights provided by
        IncomePilot are based on the information you enter. We make no warranty
        that these calculations are accurate, complete, or suitable for any
        particular purpose. Always verify important financial figures with a
        qualified accountant or financial adviser.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The Services, including all software, design, branding, and content, are
        owned by IncomePilot and protected by applicable intellectual property
        laws. Nothing in these Terms grants you any right to use our trademarks,
        logos, or brand elements without our prior written consent.
      </p>

      <h2>8. Third-Party Services</h2>
      <p>
        IncomePilot integrates with third-party services (such as Supabase for
        authentication and data storage). Your use of those services is subject
        to their respective terms and privacy policies. We are not responsible for
        the practices of third-party providers.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES
        OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
        NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE
        UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, INCOMEPILOT SHALL NOT
        BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
        PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING
        OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICES, EVEN IF WE HAVE
        BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF THESE TERMS OR
        THE SERVICES SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO INCOMEPILOT IN
        THE TWELVE MONTHS PRECEDING THE CLAIM.
      </p>

      <h2>11. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your access to the Services
        at our discretion, with or without notice, if we believe you have violated
        these Terms or for any other reason.
      </p>
      <p>
        You may delete your account at any time from within the app settings.
        Upon deletion, your data will be removed in accordance with our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We may revise these Terms at any time. When we do, we will update the
        &quot;Last updated&quot; date. Your continued use of the Services after changes
        take effect constitutes your acceptance of the revised Terms. For
        material changes we will provide notice via the app or email.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms are governed by the laws of Australia. Any disputes arising
        under these Terms shall be subject to the exclusive jurisdiction of the
        courts of Australia.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about these Terms, please contact us:
      </p>
      <ul>
        <li>Email: <a href="mailto:legal@incomepilot.app">legal@incomepilot.app</a></li>
        <li>Website: <a href="https://incomepilot.app">incomepilot.app</a></li>
      </ul>

    </LegalLayout>
  )
}
