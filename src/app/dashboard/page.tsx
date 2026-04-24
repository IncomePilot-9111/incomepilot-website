import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import PremiumGate from '@/components/PremiumGate'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  let user   = null
  let profile: { display_name: string } | null = null

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) redirect('/signin')
    user = authUser

    // Load the profile row — may not exist if the migration hasn't run yet
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    profile = data
  } catch {
    redirect('/signin')
  }

  // Resolve the best available display name
  const displayName =
    profile?.display_name ||
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Explorer'

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />

      <main className="flex-1 px-5 sm:px-8 py-16">
        <div className="mx-auto max-w-3xl space-y-6">

          {/* Greeting */}
          <div>
            <p className="section-eyebrow">PolarisPilot Dashboard</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-[#F5F7FB]">
              Welcome back,{' '}
              <span className="text-gradient-primary">{displayName}</span>
            </h1>
            <p className="mt-1 text-sm text-[#4A7A8A]">{user?.email}</p>
          </div>

          {/* Account status card */}
          <div className="glass-surface border-glow rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge">Pioneer Alpha</span>
                  <span className="badge" style={{ background: 'rgba(41,182,246,0.10)', borderColor: 'rgba(41,182,246,0.22)', color: '#60C8F5' }}>
                    Active
                  </span>
                </div>
                <p className="text-sm text-[#8CB4C0] leading-relaxed max-w-lg">
                  Your Valkoda account is active and ready. The web dashboard is in early development.
                  Download the PolarisPilot app to track your earnings, manage shifts, and hit your income goals.
                </p>
              </div>
            </div>
          </div>

          {/* Premium gated sections — server-rendered, no flicker */}
          <PremiumGate userId={user!.id} />

          {/* App CTA */}
          <div className="glass-surface rounded-2xl p-6">
            <p className="section-eyebrow mb-3">Get the app</p>
            <p className="text-sm text-[#8CB4C0] mb-5 leading-relaxed">
              Sign in with this account in the app to access all PolarisPilot features.
              Available on iOS and Android.
            </p>
            <p className="text-xs text-[#3E6474]">Coming soon to the App Store and Google Play.</p>
          </div>

          {/* Account details */}
          <div className="glass-surface rounded-2xl p-6">
            <p className="section-eyebrow mb-4">Account</p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#4A7A8A] font-medium">Display name</dt>
                <dd className="text-[#C8EDE5] font-semibold text-right">{displayName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#4A7A8A] font-medium">Email</dt>
                <dd className="text-[#C8EDE5] text-right">{user?.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#4A7A8A] font-medium">Member since</dt>
                <dd className="text-[#C8EDE5] text-right">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-AU', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })
                    : 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>

        </div>
      </main>
    </div>
  )
}
