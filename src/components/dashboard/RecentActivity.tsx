/**
 * RecentActivity -- Server Component.
 *
 * Shows a merged, date-sorted feed of recent income_entries and
 * expense_entries (up to 10 items). Income entries show in teal,
 * expense entries in amber. Amounts are formatted as AUD.
 */
import type { ActivityEntry } from '@/lib/dashboard-data'
import { MODULE_LABELS }      from '@/lib/dashboard-data'

interface Props {
  activity: ActivityEntry[]
}

function formatAUD(n: number): string {
  return new Intl.NumberFormat('en-AU', {
    style:                 'currency',
    currency:              'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function friendlyDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''

  const now  = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000)

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)   return d.toLocaleDateString('en-AU', { weekday: 'short' })
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function sourceLabel(entry: ActivityEntry): string {
  if (entry.type === 'income') {
    return entry.source ? (MODULE_LABELS[entry.source] ?? entry.source) : 'Income'
  }
  return entry.category ?? 'Expense'
}

export default function RecentActivity({ activity }: Props) {
  return (
    <div className="glass-surface rounded-2xl p-5 sm:p-6">
      <p className="section-eyebrow mb-4">Recent Activity</p>

      {activity.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-30">
            <circle cx="12" cy="12" r="9" stroke="#8CB4C0" strokeWidth="1.5"/>
            <path d="M12 7v5l3 3" stroke="#8CB4C0" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-sm text-[#4A7A8A]">No activity yet</p>
          <p className="text-xs text-[#3E6474]">Income and expense entries will appear here once synced from the app</p>
        </div>
      ) : (
        <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {activity.map((entry) => {
            const isIncome = entry.type === 'income'
            const accent   = isIncome ? '#3DD6B0' : '#F59E6A'

            return (
              <li key={entry.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">

                {/* Icon dot */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${accent}18`,
                    border:     `1px solid ${accent}30`,
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    {isIncome
                      ? <path d="M8 13V3M4 7l4-4 4 4" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      : <path d="M8 3v10M4 9l4 4 4-4" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    }
                  </svg>
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#C8EDE5] truncate">{entry.title}</p>
                  <p className="text-xs text-[#4A7A8A] mt-0.5">{sourceLabel(entry)}</p>
                </div>

                {/* Amount + date */}
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: isIncome ? '#3DD6B0' : '#F87171' }}
                  >
                    {isIncome ? '+' : '-'}{formatAUD(entry.amount)}
                  </p>
                  <p className="text-xs text-[#3E6474] mt-0.5">{friendlyDate(entry.date)}</p>
                </div>

              </li>
            )
          })}
        </ul>
      )}

      <p
        className="text-xs text-[#3E6474] mt-4 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        Showing last 10 entries synced from PolarisPilot
      </p>
    </div>
  )
}
