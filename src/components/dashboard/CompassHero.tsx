/**
 * CompassHero -- Server Component.
 *
 * Renders the Compass score ring, level badge, summary sentence,
 * 5-pillar mini-bars and positive/improvement signal lists.
 *
 * SVG ring: circumference = 2*π*54 ≈ 339. strokeDashoffset controls
 * what fraction of the arc is filled. Rotated -90° so arc starts at top.
 */
import type { CompassData } from '@/lib/dashboard-data'

interface Props {
  compass: CompassData
}

// Circumference for r=54
const CIRC = 339.3

function arcOffset(score: number): number {
  return CIRC * (1 - score / 100)
}

const PILLAR_LABELS: Record<string, string> = {
  pace:        'Pace',
  hourly:      'Hourly',
  consistency: 'Consistency',
  expenses:    'Expenses',
  readiness:   'Readiness',
}

export default function CompassHero({ compass }: Props) {
  const { score, gradeLabel, levelColor, summary, positiveSignals, improvementSignals, pillarScores } = compass

  return (
    <div
      className="glass-surface rounded-2xl p-5 sm:p-6"
      style={{ border: `1px solid ${levelColor}30`, boxShadow: `0 0 32px ${levelColor}0D` }}
    >
      <p className="section-eyebrow !mb-4">Compass Score</p>

      <div className="flex flex-col sm:flex-row gap-6">

        {/* ── Score ring ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            aria-label={`Compass score ${score} out of 100, grade ${gradeLabel}`}
          >
            {/* Background track */}
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="11"
            />
            {/* Score arc -- rotated so 0% starts at 12 o'clock */}
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke={levelColor}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={arcOffset(score)}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
            />
            {/* Score number */}
            <text
              x="70" y="65"
              textAnchor="middle"
              fontSize="28"
              fontWeight="700"
              fill="#F5F7FB"
              fontFamily="inherit"
            >
              {score}
            </text>
            <text
              x="70" y="83"
              textAnchor="middle"
              fontSize="10"
              fill="#4A7A8A"
              fontFamily="inherit"
              letterSpacing="1.5"
            >
              /100
            </text>
          </svg>

          {/* Grade badge */}
          <span
            className="text-sm font-bold px-3 py-1 rounded-full tracking-wide"
            style={{
              background: `${levelColor}18`,
              color:       levelColor,
              border:      `1px solid ${levelColor}35`,
            }}
          >
            {gradeLabel}
          </span>
        </div>

        {/* ── Right column: summary + pillars + signals ──────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Summary */}
          <p className="text-sm text-[#C8EDE5] leading-relaxed">{summary}</p>

          {/* 5-pillar mini-bars */}
          <div className="space-y-1.5">
            {(Object.entries(pillarScores) as [keyof typeof pillarScores, number][]).map(([key, val]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-[#4A7A8A] w-24 flex-shrink-0">
                  {PILLAR_LABELS[key]}
                </span>
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:      `${val}%`,
                      background: val >= 85 ? '#55CC94' : val >= 70 ? '#68B2FF' : val >= 50 ? '#F2AA4C' : '#FF5C7A',
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-[#8CB4C0] w-8 text-right flex-shrink-0">
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Signals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {/* Positive */}
            {positiveSignals.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#3DD6B0] mb-1.5 uppercase tracking-widest">
                  Working well
                </p>
                <ul className="space-y-1">
                  {positiveSignals.map((s) => (
                    <li key={s} className="flex items-start gap-1.5 text-xs text-[#8CB4C0]">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-0.5 flex-shrink-0">
                        <path d="M3 8l4 4 6-7" stroke="#3DD6B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvement */}
            {improvementSignals.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#F59E6A] mb-1.5 uppercase tracking-widest">
                  Focus areas
                </p>
                <ul className="space-y-1">
                  {improvementSignals.slice(0, 3).map((s) => (
                    <li key={s} className="flex items-start gap-1.5 text-xs text-[#8CB4C0]">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-0.5 flex-shrink-0">
                        <path d="M8 3v6M8 11v1" stroke="#F59E6A" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
