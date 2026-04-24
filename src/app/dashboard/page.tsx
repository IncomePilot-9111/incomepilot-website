import { redirect }    from 'next/navigation'
import type { Metadata } from 'next'
import Nav          from '@/components/Nav'
import PremiumGate  from '@/components/PremiumGate'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title:  'Dashboard | PolarisPilot',
  robots: { index: false, follow: false },
}

export default async function DashboardPage() {
  let user    = null
  let profile: { display_name: string | null } | null = null

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) redirect('/signin')
    user = authUser

    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    profile = data
  } catch {
    redirect('/signin')
  }

  const displayName =
    profile?.display_name ||
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Explorer'

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-AU', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* ── Command centre header ──────────────────────────────────── */}
          <div className="glass-surface rounded-2xl px-6 py-5 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="section-eyebrow !mb-1.5">PolarisPilot Command Centre</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F7FB] leading-tight">
                  Welcome back,{' '}
                  <span className="text-gradient-primary">{displayName}</span>
                </h1>
                <p className="text-sm text-[#4A7A8A] mt-0.5">{user?.email}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="badge">Pioneer Alpha</span>
                <span
                  className="badge"
                  style={{
                    background:   'rgba(41,182,246,0.10)',
                    borderColor:  'rgba(41,182,246,0.22)',
                    color:        '#60C8F5',
                  }}
                >
                  Active
                </span>
                {memberSince && (
                  <span
                    className="text-xs text-[#3E6474] hidden sm:inline"
                  >
                    Member since {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Premium gated content (server-rendered, no flicker) ────── */}
          <PremiumGate userId={user!.id} />

          {/* ── App download CTA ──────────────────────────────────────── */}
          <div className="glass-surface rounded-2xl px-6 py-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="section-eyebrow !mb-1">Get the app</p>
                <p className="text-sm text-[#8CB4C0]">
                  Sign in with this account to access all PolarisPilot features on the go.
                </p>
              </div>
              <p className="text-xs text-[#3E6474] flex-shrink-0">Coming to App Store and Google Play</p>
            </div>
          </div>

          {/* ── Account details ───────────────────────────────────────── */}
          <div className="glass-surface rounded-2xl px-6 py-5">
            <p className="section-eyebrow mb-4">Account</p>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-xs text-[#4A7A8A] font-medium mb-0.5">Display name</dt>
                <dd className="text-[#C8EDE5] font-semibold">{displayName}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#4A7A8A] font-medium mb-0.5">Email</dt>
                <dd className="text-[#C8EDE5] truncate">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#4A7A8A] font-medium mb-0.5">Member since</dt>
                <dd className="text-[#C8EDE5]">{memberSince ?? 'Unknown'}</dd>
              </div>
            </dl>
          </div>

        </div>
      </main>
    </div>
  )
}
