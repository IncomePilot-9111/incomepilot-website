import type { Metadata } from 'next'
import LegalLayout from '@/components/LegalLayout'

export const metadata: Metadata = {
  title: 'Delete Your Account',
  description: 'How to delete your PolarisPilot account and associated data.',
}

export default function DeleteAccountPage() {
  return (
    <LegalLayout
      title="Delete Your Account"
      subtitle="You can delete your PolarisPilot account and all associated data at any time."
      lastUpdated="25 June 2026"
    >

      <h2>1. In-App Deletion</h2>
      <p>
        The quickest way to delete your account is directly inside the app:
      </p>
      <p>
        Open PolarisPilot &rarr; <strong>Settings</strong> &rarr; <strong>Delete Account</strong>.
      </p>
      <p>
        This initiates deletion of your account and any cloud-backed data within 30 days.
      </p>

      <h2>2. Deletion by Email</h2>
      <p>
        If you cannot access the app, email us at{' '}
        <a href="mailto:privacy@valkoda.app">privacy@valkoda.app</a> from the
        address associated with your account and request deletion. We will verify
        your identity and process your request within 30 days.
      </p>

      <h2>3. What Gets Deleted</h2>
      <ul>
        <li>Your account and profile</li>
        <li>Any earnings or other data backed up to our cloud</li>
      </ul>
      <p>
        Data stored only on your device is removed when you delete the app or
        clear its data. Deleting the app from your device does <strong>not</strong>{' '}
        automatically delete your account or cloud-backed data.
      </p>

      <h2>4. Data We May Retain</h2>
      <p>
        Some records may be retained where required by law, for example for fraud
        prevention or accounting purposes, as described in our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>5. Contact</h2>
      <p>
        For any questions about account or data deletion:
      </p>
      <ul>
        <li>Email: <a href="mailto:privacy@valkoda.app">privacy@valkoda.app</a></li>
      </ul>

    </LegalLayout>
  )
}
