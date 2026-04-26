/**
 * EarningsTrend -- Server Component.
 *
 * Renders a 7-day earnings / expense bar chart as pure SVG.
 * No client-side JavaScript or npm chart dependencies required.
 *
 * Layout per day column:
 *   [income bar (teal)]  [expense bar (amber)]  day label
 * Bars are normalised to the maximum value across all 14 bars (both series).
 */
import type { TrendDay } from '@/lib/dashboard-data'

interface Props {
  trend: TrendDay[]
}

const CHART_H   = 80    // usable bar area height (px)
const CHART_W   = 320   // total SVG width
const COL_W     = CHART_W / 7      // ~45.7
const BAR_W     = 12
const BAR_GAP   = 3     // gap between the two bars in a column
const LABEL_Y   = CHART_H + 16
const VIEW_H    = CHART_H + 24

function formatAUD(n: number): string {
  if (n === 0) return '$0'
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${Math.round(n)}`
}

export default function EarningsTrend({ trend }: Props) {
  const hasData = trend.some(d => d.income > 0 || d.expense > 0)

  const maxVal = Math.max(
    ...trend.map(d => d.income),
    ...trend.map(d => d.expense),
    1, // avoid div/0
  )

  const barHeight = (val: number): number =>
    val === 0 ? 2 : Math.max(4, (val / maxVal) * CHART_H)

  return (
    <div className="glass-surface rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="section-eyebrow !mb-0">7-Day Earnings Trend</p>
        <div className="flex items-center gap-3 text-xs text-[#4A7A8A]">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm" style={{ background: '#3DD6B0' }} />
            Income
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm" style={{ background: '#F59E6A' }} />
            Expenses
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-30">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#8CB4C0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm text-[#4A7A8A]">No trend data yet</p>
          <p className="text-xs text-[#3E6474]">Log income in the app to see weekly trends</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_W} ${VIEW_H}`}
            width="100%"
            style={{ minWidth: '260px', display: 'block' }}
            aria-label="7-day earnings and expense trend chart"
          >
            {/* Subtle horizontal gridlines */}
            {[0.25, 0.5, 0.75, 1].map((frac) => (
              <line
                key={frac}
                x1="0"
                y1={CHART_H - CHART_H * frac}
                x2={CHART_W}
                y2={CHART_H - CHART_H * frac}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
            ))}

            {trend.map((day, i) => {
              const cx       = i * COL_W + COL_W / 2
              const ih       = barHeight(day.income)
              const eh       = barHeight(day.expense)
              const ix       = cx - BAR_W - BAR_GAP / 2
              const ex       = cx + BAR_GAP / 2
              const isToday  = day.isToday
              const incFill  = day.income > 0 ? '#3DD6B0' : 'rgba(61,214,176,0.18)'
              const expFill  = day.expense > 0 ? '#F59E6A' : 'rgba(245,158,110,0.18)'

              return (
                <g key={day.date}>
                  {/* Today highlight column */}
                  {isToday && (
                    <rect
                      x={cx - COL_W / 2}
                      y={0}
                      width={COL_W}
                      height={CHART_H}
                      fill="rgba(61,214,176,0.04)"
                      rx="4"
                    />
                  )}

                  {/* Income bar */}
                  <rect
                    x={ix}
                    y={CHART_H - ih}
                    width={BAR_W}
                    height={ih}
                    fill={incFill}
                    rx="3"
                    aria-label={`${day.label} income ${formatAUD(day.income)}`}
                  />

                  {/* Expense bar */}
                  <rect
                    x={ex}
                    y={CHART_H - eh}
                    width={BAR_W}
                    height={eh}
                    fill={expFill}
                    rx="3"
                    aria-label={`${day.label} expenses ${formatAUD(day.expense)}`}
                  />

                  {/* Day label */}
                  <text
                    x={cx}
                    y={LABEL_Y}
                    textAnchor="middle"
                    fontSize="9"
                    fill={isToday ? '#3DD6B0' : '#4A7A8A'}
                    fontWeight={isToday ? '700' : '400'}
                    fontFamily="inherit"
                  >
                    {day.label}
                  </text>

                  {/* Income value above bar (only when > 0 and tall enough) */}
                  {day.income > 0 && ih > 16 && (
                    <text
                      x={ix + BAR_W / 2}
                      y={CHART_H - ih - 4}
                      textAnchor="middle"
                      fontSize="7.5"
                      fill="#3DD6B0"
                      fontFamily="inherit"
                    >
                      {formatAUD(day.income)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      )}

      {/* Net summary row */}
      {hasData && (
        <div
          className="mt-3 pt-3 flex items-center justify-between text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="text-[#4A7A8A]">7-day net</span>
          <span
            className="font-semibold"
            style={{
              color: trend.reduce((s, d) => s + d.net, 0) >= 0 ? '#3DD6B0' : '#F87171',
            }}
          >
            {formatAUD(trend.reduce((s, d) => s + d.net, 0))}
          </span>
        </div>
      )}
    </div>
  )
}
