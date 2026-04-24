/**
 * PremiumGate -- Server Component.
 *
 * Phase 1 dashboard: reads premium status from DB, then conditionally
 * renders the full dashboard (summary cards, calendar preview, export
 * centre) or a locked preview with an upgrade prompt.
 *
 * All data loading is server-side -- no loading flicker, no client
 * secrets exposed.
 */
import { createServiceClient } from '@/lib/supabase/service'
import { loadDashboardData }   from '@/lib/dashboard-data'
import type { DashboardData, CalendarEvent } from '@/lib/dashboard-data'
import PremiumRefreshButton from './PremiumRefreshButton'

interface Props {
  userId: string
}

// ─── Currency formatter ───────────────────────────────────────────────────────

function formatAUD(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style:                 'currency',
    currency:              'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatEventDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-AU', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
  })
}

// ─── Gate ─────────────────────────────────────────────────────────────────────

export default async function PremiumGate({ userId }: Props) {
  let isPremium   = false
  let expiresAt:   string | null = null
  let entitlement: string | null = null

  try {
    const service = createServiceClient()
    const { data } = await service
      .from('premium_entitlements')
      .select('is_active, expires_at, entitlement')
      .eq('user_id', userId)
      .single()

    isPremium   = data?.is_active   === true
    expiresAt   = data?.expires_at  ?? null
    entitlement = data?.entitlement ?? null
  } catch {
    isPremium = false
  }

  if (isPremium) {
    const dashData = await loadDashboardData(userId)
    return (
      <PremiumDashboard
        expiresAt={expiresAt}
        entitlement={entitlement}
        data={dashData}
      />
    )
  }

  return <LockedDashboard />
}

// ─── Premium dashboard ────────────────────────────────────────────────────────

function PremiumDashboard({
  expiresAt,
  entitlement,
  data,
}: {
  expiresAt:   string | null
  entitlement: string | null
  data:        DashboardData
}) {
  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-AU', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <div className="space-y-5">

      {/* ── Pro status banner ─────────────────────────────────────────── */}
      <div
        className="glass-surface rounded-2xl p-4 sm:p-5"
        style={{ border: '1px solid rgba(61,214,176,0.32)', boxShadow: '0 0 24px rgba(61,214,176,0.07)' }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(61,214,176,0.15)', border: '1px solid rgba(61,214,176,0.35)' }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1l1.8 4.1H14l-3.4 2.7 1.3 4.2L8 9.5 4.1 12l1.3-4.2L2 5.1h4.2z" fill="#3DD6B0" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#C8EDE5]">
                {entitlement ?? 'PolarisPilot Pro'} active
              </p>
              {expiryLabel && (
                <p className="text-xs text-[#4A7A8A] mt-0.5">Renews {expiryLabel}</p>
              )}
            </div>
          </div>
          <PremiumRefreshButton />
        </div>
      </div>

      {/* ── Summary cards ─────────────────────────────────────────────── */}
      <SummaryCards data={data} />

      {/* ── Calendar + Goals row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <CalendarPreview events={data.upcomingEvents} />
        </div>
        <div className="lg:col-span-2">
          <GoalsCard goal={data.goal} />
        </div>
      </div>

      {/* ── Export centre ─────────────────────────────────────────────── */}
      <ExportCentre />

    </div>
  )
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCards({ data }: { data: DashboardData }) {
  const { summary, modules } = data

  const netPositive = summary.netIncome >= 0

  const cards = [
    {
      label:    'Total Income',
      value:    formatAUD(summary.totalIncome),
      sub:      summary.periodLabel,
      accent:   '#3DD6B0',
      iconPath: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
    },
    {
      label:    'Total Expenses',
      value:    formatAUD(summary.totalExpenses),
      sub:      summary.periodLabel,
      accent:   '#F59E6A',
      iconPath: 'M20 12V22H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z',
    },
    {
      label:    'Net Income',
      value:    formatAUD(summary.netIncome),
      sub:      summary.periodLabel,
      accent:   netPositive ? '#5EE4C0' : '#F87171',
      iconPath: 'M3 3h18v18H3zM9 9h6M9 12h6M9 15h4',
    },
    {
      label:    'Active Modules',
      value:    modules.count > 0 ? String(modules.count) : '0',
      sub:      modules.count === 1 ? 'platform tracked' : 'platforms tracked',
      accent:   '#A78BFA',
      iconPath: 'M4 6h16M4 12h16M4 18h7',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {cards.map(({ label, value, sub, accent, iconPath }) => (
        <div
          key={label}
          className="glass-surface rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: `rgba(${hexToRgbStr(accent)},0.12)`,
                border:     `1px solid rgba(${hexToRgbStr(accent)},0.25)`,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d={iconPath} stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-[#4A7A8A] leading-tight">{label}</p>
          </div>
          <div>
            <p
              className="text-xl sm:text-2xl font-bold leading-none"
              style={{ color: accent }}
            >
              {value}
            </p>
            <p className="text-xs text-[#3E6474] mt-1">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Convert 6-char hex to "R,G,B" string for rgba() usage */
function hexToRgbStr(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r},${g},${b}`
}

// ─── Calendar preview ─────────────────────────────────────────────────────────

const EVENT_TYPE_CONFIG: Record<CalendarEvent['type'], { label: string; color: string }> = {
  shift:   { label: 'Shift',   color: '#3DD6B0' },
  payday:  { label: 'Payday',  color: '#5EE4C0' },
  booking: { label: 'Booking', color: '#A78BFA' },
  other:   { label: 'Event',   color: '#8CB4C0' },
}

function CalendarPreview({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="glass-surface rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="section-eyebrow !mb-0">Upcoming Schedule</p>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(61,214,176,0.10)', color: '#4A7A8A', border: '1px solid rgba(61,214,176,0.15)' }}
        >
          Next 5
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-30">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#8CB4C0" strokeWidth="1.5" />
            <path d="M16 2v4M8 2v4M3 10h18" stroke="#8CB4C0" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-[#4A7A8A]">No upcoming events</p>
          <p className="text-xs text-[#3E6474]">Use the PolarisPilot app to schedule shifts and bookings</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-2">
          {events.map((event) => {
            const cfg = EVENT_TYPE_CONFIG[event.type]
            return (
              <li
                key={event.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.025)' }}
              >
                <div
                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ background: cfg.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#C8EDE5] truncate">{event.title}</p>
                  <p className="text-xs text-[#4A7A8A] mt-0.5">{formatEventDate(event.scheduledAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {event.amountExpected !== null ? (
                    <p className="text-sm font-semibold" style={{ color: cfg.color }}>
                      +{formatAUD(event.amountExpected)}
                    </p>
                  ) : (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `rgba(${hexToRgbStr(cfg.color)},0.10)`,
                        color: cfg.color,
                        border: `1px solid rgba(${hexToRgbStr(cfg.color)},0.20)`,
                      }}
                    >
                      {cfg.label}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="text-xs text-[#3E6474] mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        Sync from the PolarisPilot app to update your schedule
      </p>
    </div>
  )
}

// ─── Goals card ───────────────────────────────────────────────────────────────

function GoalsCard({ goal }: { goal: import('@/lib/dashboard-data').GoalData | null }) {
  if (!goal) {
    return (
      <div className="glass-surface rounded-2xl p-5 h-full flex flex-col">
        <p className="section-eyebrow !mb-0 mb-4">Goals and XP</p>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-30">
            <circle cx="12" cy="12" r="9" stroke="#8CB4C0" strokeWidth="1.5" />
            <path d="M12 8v4l3 3" stroke="#8CB4C0" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-[#4A7A8A]">No active goal</p>
          <p className="text-xs text-[#3E6474]">Set an income goal in the app to track progress here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-surface rounded-2xl p-5 h-full flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="section-eyebrow !mb-0">Goals and XP</p>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.25)' }}
        >
          Lv {goal.level}
        </span>
      </div>

      {/* Goal progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-[#C8EDE5]">{goal.label}</p>
          <p className="text-sm font-bold text-[#3DD6B0]">{goal.progressPct}%</p>
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:      `${goal.progressPct}%`,
              background: 'linear-gradient(90deg, #3DD6B0 0%, #5EE4C0 100%)',
              boxShadow:  '0 0 8px rgba(61,214,176,0.4)',
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-[#4A7A8A]">
          <span>{formatAUD(goal.currentAmount)}</span>
          <span>{formatAUD(goal.targetAmount)}</span>
        </div>
      </div>

      {/* XP */}
      <div
        className="mt-auto rounded-xl p-3 flex items-center gap-3"
        style={{ background: 'rgba(167,139,250,0.07)', border: '1px solid rgba(167,139,250,0.15)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}
        >
          XP
        </div>
        <div>
          <p className="text-sm font-bold text-[#C8EDE5]">{goal.xp.toLocaleString('en-AU')}</p>
          <p className="text-xs text-[#4A7A8A]">Total experience points</p>
        </div>
      </div>
    </div>
  )
}

// ─── Export centre ────────────────────────────────────────────────────────────

const EXPORT_ITEMS = [
  {
    id:       'income-pdf',
    title:    'Income Summary',
    format:   'PDF',
    desc:     'Monthly income breakdown across all platforms',
    accent:   '#3DD6B0',
    iconPath: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  },
  {
    id:       'tax-report',
    title:    'Tax Report',
    format:   'PDF',
    desc:     'ATO-ready income and expense summary for lodgement',
    accent:   '#60C8F5',
    iconPath: 'M9 14l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id:       'shift-csv',
    title:    'Shift History',
    format:   'CSV',
    desc:     'Complete shift log with hours, earnings, and platform',
    accent:   '#A78BFA',
    iconPath: 'M4 6h16M4 10h16M4 14h8M4 18h8M14 14h6M14 18h6',
  },
] as const

function ExportCentre() {
  return (
    <div className="glass-surface rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="section-eyebrow !mb-0">Export Centre</p>
          <p className="text-xs text-[#4A7A8A] mt-1">Download your income data in various formats</p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
          style={{ background: 'rgba(245,158,110,0.10)', color: '#F59E6A', border: '1px solid rgba(245,158,110,0.22)' }}
        >
          Coming soon
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {EXPORT_ITEMS.map(({ id, title, format, desc, accent, iconPath }) => (
          <div
            key={id}
            className="rounded-xl p-4 flex flex-col gap-3 opacity-60 cursor-not-allowed select-none"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
            aria-disabled="true"
          >
            <div className="flex items-start justify-between">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: `rgba(${hexToRgbStr(accent)},0.12)`,
                  border:     `1px solid rgba(${hexToRgbStr(accent)},0.22)`,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d={iconPath} stroke={accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  background: `rgba(${hexToRgbStr(accent)},0.10)`,
                  color: accent,
                }}
              >
                {format}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#C8EDE5]">{title}</p>
              <p className="text-xs text-[#4A7A8A] mt-0.5 leading-relaxed">{desc}</p>
            </div>
            <div className="mt-auto flex items-center gap-1.5 text-xs text-[#3E6474]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="#3E6474" strokeWidth="2" />
                <path d="M8 11V7a4 4 0 018 0v4" stroke="#3E6474" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Available in a future update
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Locked dashboard (non-premium) ──────────────────────────────────────────

function LockedDashboard() {
  return (
    <div className="space-y-5">

      {/* Upgrade CTA */}
      <div
        className="glass-surface rounded-2xl p-6"
        style={{ border: '1px solid rgba(61,214,176,0.18)' }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(61,214,176,0.10)', border: '1px solid rgba(61,214,176,0.22)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="#3DD6B0" strokeWidth="1.8" />
              <path d="M8 11V7a4 4 0 018 0v4" stroke="#3DD6B0" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-[#C8EDE5] mb-1.5">
              Unlock the full dashboard with Pro
            </p>
            <p className="text-sm text-[#8CB4C0] leading-relaxed mb-4">
              Subscribe to PolarisPilot Pro in the iOS or Android app to unlock income tracking,
              shift calendar, tax reports, export tools, and more.
              Your subscription syncs here automatically.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                'Income summary',
                'Shift calendar',
                'Tax reports',
                'Export centre',
                'Goals and XP',
              ].map((feat) => (
                <span key={feat} className="badge text-[10px] py-0.5">
                  {feat}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#3E6474]">Available on iOS and Android. Coming to the App Store and Google Play.</p>
          </div>
        </div>
      </div>

      {/* Blurred preview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" aria-hidden="true">
        {[
          { label: 'Total Income',    value: '$0.00',   accent: '#3DD6B0' },
          { label: 'Total Expenses',  value: '$0.00',   accent: '#F59E6A' },
          { label: 'Net Income',      value: '$0.00',   accent: '#5EE4C0' },
          { label: 'Active Modules',  value: '0',       accent: '#A78BFA' },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="glass-surface rounded-2xl p-4 sm:p-5 relative overflow-hidden"
            style={{ opacity: 0.45 }}
          >
            <p className="text-xs font-semibold text-[#4A7A8A] mb-2">{label}</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: accent }}>{value}</p>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[3px]">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#8CB4C0]"
                style={{ background: 'rgba(7,15,21,0.80)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="#4A7A8A" strokeWidth="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="#4A7A8A" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Pro only
              </div>
            </div>
          </div>
        ))}
      </div>

      {[
        { label: 'Upcoming Schedule', hint: 'See your next shifts, paydays and bookings' },
        { label: 'Goals and XP',      hint: 'Track income goals and earn experience points' },
        { label: 'Export Centre',     hint: 'Download income reports and tax summaries' },
      ].map(({ label, hint }) => (
        <div
          key={label}
          className="glass-surface rounded-2xl p-6 relative overflow-hidden"
          style={{ opacity: 0.45 }}
          aria-hidden="true"
        >
          <p className="section-eyebrow mb-2">{label}</p>
          <p className="text-sm text-[#8CB4C0]">{hint}</p>

          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[3px]">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-[#8CB4C0]"
              style={{ background: 'rgba(7,15,21,0.80)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="#4A7A8A" strokeWidth="2" />
                <path d="M8 11V7a4 4 0 018 0v4" stroke="#4A7A8A" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Pro only
            </div>
          </div>
        </div>
      ))}

      {/* Already subscribed? */}
      <div className="flex justify-center pt-1">
        <PremiumRefreshButton label="Already subscribed? Refresh status" />
      </div>
    </div>
  )
}
