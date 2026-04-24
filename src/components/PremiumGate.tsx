/**
 * PremiumGate — Server Component.
 *
 * Reads the user's premium status directly from the DB (service role, no
 * RLS needed) and renders either the premium dashboard sections or the
 * locked-preview with an upgrade prompt.
 *
 * This runs server-side at render time, so there is no client-side secret
 * exposure and no loading flicker.
 */
import { createServiceClient } from '@/lib/supabase/service'
import PremiumRefreshButton from './PremiumRefreshButton'

interface Props {
  userId: string
}

export default async function PremiumGate({ userId }: Props) {
  // Read current status from DB — fast, no external network call
  let isPremium = false
  let expiresAt: string | null = null

  try {
    const service = createServiceClient()
    const { data } = await service
      .from('premium_entitlements')
      .select('is_active, expires_at')
      .eq('user_id', userId)
      .single()

    isPremium = data?.is_active === true
    expiresAt = data?.expires_at ?? null
  } catch {
    // Service key not configured or DB unavailable — safe default to free
    isPremium = false
  }

  if (isPremium) {
    return <PremiumContent expiresAt={expiresAt} />
  }

  return <LockedContent />
}

// ─── Premium content (active subscriber) ─────────────────────────────────────

function PremiumContent({ expiresAt }: { expiresAt: string | null }) {
  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-AU', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <div className="space-y-4">
      {/* Pro status banner */}
      <div
        className="glass-surface border-glow rounded-2xl p-5"
        style={{ borderColor: 'rgba(61,214,176,0.35)' }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(61,214,176,0.15)', border: '1px solid rgba(61,214,176,0.35)' }}
            >
              {/* Star icon */}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 1l1.8 4.1H14l-3.4 2.7 1.3 4.2L8 9.5 4.1 12l1.3-4.2L2 5.1h4.2z"
                  fill="#3DD6B0"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#C8EDE5]">PolarisPilot Pro active</p>
              {expiryLabel && (
                <p className="text-xs text-[#4A7A8A] mt-0.5">Renews {expiryLabel}</p>
              )}
            </div>
          </div>
          <PremiumRefreshButton />
        </div>
      </div>

      {/* Earnings summary placeholder */}
      <div className="glass-surface rounded-2xl p-6">
        <p className="section-eyebrow mb-4">Earnings</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'This week',  value: '—' },
            { label: 'This month', value: '—' },
            { label: 'Best day',   value: '—' },
            { label: 'Avg / hour', value: '—' },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-xs text-[#4A7A8A] font-medium">{label}</p>
              <p className="text-lg font-bold text-[#C8EDE5]">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#3E6474]">
          Sync from the PolarisPilot app to see your earnings here.
        </p>
      </div>

      {/* Calendar placeholder */}
      <div className="glass-surface rounded-2xl p-6">
        <p className="section-eyebrow mb-2">Calendar</p>
        <p className="text-sm text-[#8CB4C0]">
          Your shift calendar will appear here once web sync is available.
        </p>
      </div>

      {/* Reports placeholder */}
      <div className="glass-surface rounded-2xl p-6">
        <p className="section-eyebrow mb-2">Reports</p>
        <p className="text-sm text-[#8CB4C0]">
          Income and tax reports coming to the web dashboard soon.
        </p>
      </div>
    </div>
  )
}

// ─── Locked preview (free / no subscription) ─────────────────────────────────

function LockedContent() {
  return (
    <div className="space-y-4">
      {/* Upgrade prompt */}
      <div className="glass-surface rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(61,214,176,0.10)', border: '1px solid rgba(61,214,176,0.20)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="#3DD6B0" strokeWidth="1.8" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#3DD6B0" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#C8EDE5] mb-1">
              Pro features are available in the app
            </p>
            <p className="text-sm text-[#8CB4C0] leading-relaxed">
              Subscribe to PolarisPilot Pro in the iOS or Android app to unlock
              earnings tracking, shift calendar, income reports, and more.
              Your subscription syncs here automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Blurred / locked feature previews */}
      {[
        { label: 'Earnings', hint: 'Track income by shift, week, and month' },
        { label: 'Calendar', hint: 'Visualise your work schedule' },
        { label: 'Reports',  hint: 'Export income summaries for tax time' },
      ].map(({ label, hint }) => (
        <div
          key={label}
          className="glass-surface rounded-2xl p-6 relative overflow-hidden"
          style={{ opacity: 0.5 }}
          aria-hidden="true"
        >
          <p className="section-eyebrow mb-2">{label}</p>
          <p className="text-sm text-[#8CB4C0]">{hint}</p>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-[#8CB4C0]"
              style={{ background: 'rgba(7,15,21,0.75)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="#4A7A8A" strokeWidth="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#4A7A8A" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Pro only
            </div>
          </div>
        </div>
      ))}

      {/* Already subscribed? Refresh button */}
      <div className="flex justify-center pt-1">
        <PremiumRefreshButton label="Already subscribed? Refresh status" />
      </div>
    </div>
  )
}
