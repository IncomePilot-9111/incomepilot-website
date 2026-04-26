/**
 * ModuleBreakdown -- Server Component.
 *
 * Horizontal bar chart showing income contribution per active platform/module
 * for the current month. Bars are proportional to each module's share of
 * total income. Colours match the PolarisPilot module palette.
 */
import type { ModuleIncome } from '@/lib/dashboard-data'
import { MODULE_COLORS }     from '@/lib/dashboard-data'

interface Props {
  breakdown: ModuleIncome[]
  currency?: string
}

function formatAUD(n: number): string {
  return new Intl.NumberFormat('en-AU', {
    style:                 'currency',
    currency:              'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

const MODULE_ICONS: Record<string, string> = {
  shift_worker: 'M12 2a3 3 0 110 6 3 3 0 010-6zM6 20v-2a6 6 0 1112 0v2',
  rideshare:    'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l4 4v6M16 17h2M7 17h6M5 17a2 2 0 100 4 2 2 0 000-4zM17 17a2 2 0 100 4 2 2 0 000-4z',
  delivery:     'M21 10l-4-4H5a2 2 0 00-2 2v9h2m14 0H9M7 17a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z',
  freelance:    'M12 2l3 6.5h7L17 13l2.5 7-7.5-5-7.5 5L7 13l-5-4.5h7z',
  rentals:      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  salary:       'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  manual:       'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
}

const FALLBACK_ICON = 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'

export default function ModuleBreakdown({ breakdown, currency = 'AUD' }: Props) {
  void currency  // reserved for future multi-currency support

  return (
    <div className="glass-surface rounded-2xl p-5 h-full flex flex-col">
      <p className="section-eyebrow mb-4">Module Breakdown</p>

      {breakdown.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-30">
            <path d={FALLBACK_ICON} stroke="#8CB4C0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm text-[#4A7A8A]">No module data yet</p>
          <p className="text-xs text-[#3E6474]">Income logged via the app will appear broken down by platform</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-3">
          {breakdown.map((mod) => {
            const color   = MODULE_COLORS[mod.source] ?? '#8CB4C0'
            const icon    = MODULE_ICONS[mod.source]  ?? FALLBACK_ICON

            return (
              <li key={mod.source} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${color}18`,
                        border:     `1px solid ${color}30`,
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d={icon} stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#C8EDE5] truncate">{mod.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-[#4A7A8A]">{mod.pct}%</span>
                    <span className="text-sm font-semibold" style={{ color }}>{formatAUD(mod.amount)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:      `${mod.pct}%`,
                      background: color,
                      boxShadow:  `0 0 6px ${color}50`,
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p
        className="text-xs text-[#3E6474] mt-4 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        Income by platform this month
      </p>
    </div>
  )
}
