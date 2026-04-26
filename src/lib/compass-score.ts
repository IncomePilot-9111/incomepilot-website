/**
 * Web-safe Compass Score computation -- v2.
 *
 * Aligned with CompassInsightsSummaryKernel.build() in the PolarisPilot mobile
 * app (compass_insights_summary.dart). This is a server-side re-derivation
 * using Supabase-backed equivalents of the mobile 5-pillar formula.
 *
 * Reference: flutter_application_1/lib/data/compass_insights_summary.dart
 * (read-only reference -- not copied. WEBSITE ONLY changes.)
 *
 * 5 pillars (weights sum to 1.0):
 *   Pace         25% -- goal progress vs projected target for current date
 *   Hourly       20% -- FALLBACK constant 70 (WorkHub delta data not in Supabase)
 *   Consistency  20% -- coverage x 100 minus variance penalty, clamped 30-100
 *   Expenses     20% -- expense ratio (expenses / income, this week)
 *   Readiness    15% -- sum of 4 binary signals (income, expenses, setup, categories)
 *
 * No-data fallback: ALL pillars return 70 when inputs are sparse.
 * Composite score when all pillars are 70 = 70 (matches mobile exactly).
 *
 * Grade labels (mobile-aligned _gradeFor thresholds):
 *   90-100  A
 *   85-89   A-
 *   80-84   B+
 *   70-79   B
 *   60-69   C
 *   50-59   D
 *   0-49    NA
 *
 * Score colours (mobile _scoreColor thresholds):
 *   >= 85  #55CC94  (semantic success green)
 *   >= 70  #3DD6B0  (secondary teal)
 *   >= 50  #F2AA4C  (semantic warning amber)
 *   <  50  #FF5C7A  (semantic danger red)
 *
 * All functions are pure and deterministic. Safe to call with zeroed inputs.
 */

// --- Types -------------------------------------------------------------------

export interface CompassInput {
  /** Week-to-date gross income (AUD), Monday-Sunday current week */
  weekIncome: number
  /** Week-to-date total expenses (AUD), Monday-Sunday current week.
   *  Note: mobile uses allocatedBusinessAmount per entry; web uses
   *  expense_entries.amount -- closest available field in Supabase. */
  weekExpenses: number
  /** Count of distinct days this week with at least one income entry (0-7) */
  weekActiveDays: number
  /** Per-day income totals for the active days only (used for variance calc).
   *  Length should equal weekActiveDays. */
  weekDailyAmounts: number[]
  /** True if the user has any income entries in all-time history */
  hasAnyHistory: boolean
  /** True if tax reporting setup acknowledged:
   *  ato_setup_completed OR manual_setup_completed OR tax_disabled
   *  from tax_reports_profile table. */
  reportSetupAcknowledged: boolean
  /** 0..1 -- share of this-week expense entries with a non-empty category */
  categoryCoverage: number
  /** Count of expense entries this week */
  weekExpenseCount: number
  /** Goal pace derived from month progress vs expected daily target.
   *  null = no active goal (neutral fallback). */
  goalPaceStatus: 'ahead' | 'onPace' | 'behind' | null
}

export interface CompassPillarScores {
  pace:        number  // 0-100
  hourly:      number  // 0-100
  consistency: number  // 0-100
  expenses:    number  // 0-100
  readiness:   number  // 0-100
}

export interface CompassData {
  score:              number               // 0-100 integer
  gradeLabel:         string               // 'A' | 'A-' | 'B+' | 'B' | 'C' | 'D' | 'NA'
  levelColor:         string               // hex accent colour matching grade
  summary:            string               // one sentence for the hero card
  positiveSignals:    string[]             // what is working well
  improvementSignals: string[]             // what to focus on
  pillarScores:       CompassPillarScores
}

// --- Pillar calculators (pure, return 0-100) ---------------------------------

/** Pace: goal progress vs projected daily target.
 *  Mirrors mobile _buildPacePillar.
 *  null (no active goal) -> neutral 70. */
export function calcPaceScore(status: CompassInput['goalPaceStatus']): number {
  if (status === null)     return 70  // neutral -- no goal (matches mobile no-forecast fallback)
  if (status === 'ahead')  return 95
  if (status === 'onPace') return 80
  return 50  // 'behind'
}

/** Hourly: week-over-week hourly earnings delta.
 *  Mobile uses WorkHub delta data unavailable in Supabase.
 *  Returns mobile no-data fallback (70) with documented deviation. */
export function calcHourlyScore(): number {
  return 70  // constant fallback -- WorkHub delta not available in Supabase
}

/** Consistency: coverage x 100 minus coefficient-of-variation penalty.
 *  Mirrors mobile _buildConsistencyPillar.
 *
 *  Formula: value = (coverage x 100 - (dispersion / 2) x 20).clamp(30, 100)
 *  coverage   = weekActiveDays / 7
 *  dispersion = (stdDev / mean).clamp(0, 2)  [0 when mean = 0]
 */
export function calcConsistencyScore(
  weekActiveDays: number,
  weekDailyAmounts: number[],
): number {
  // No activity this week -> no-data fallback
  if (weekActiveDays === 0) return 70

  const coverage = weekActiveDays / 7

  let dispersion = 0
  if (weekDailyAmounts.length >= 2) {
    const mean = weekDailyAmounts.reduce((s, v) => s + v, 0) / weekDailyAmounts.length
    if (mean > 0) {
      const variance =
        weekDailyAmounts.reduce((s, v) => s + (v - mean) ** 2, 0) / weekDailyAmounts.length
      const stdDev = Math.sqrt(variance)
      dispersion = Math.min(2, stdDev / mean)
    }
  }

  const raw = coverage * 100 - (dispersion / 2) * 20
  return Math.round(Math.max(30, Math.min(100, raw)))
}

/** Expenses: ratio of expenses to income (lower ratio = better).
 *  Mirrors mobile _buildExpensesPillar.
 *  Uses week-scoped data (not month-to-date as in v1).
 *  weekIncome <= 0 -> neutral 70. */
export function calcExpensesScore(weekIncome: number, weekExpenses: number): number {
  if (weekIncome <= 0) return 70  // no-data fallback
  const ratio = weekExpenses / weekIncome
  if (ratio < 0.15) return 90
  if (ratio < 0.30) return 75
  if (ratio < 0.50) return 55
  return 35
}

/** Readiness: sum of 4 binary signals (25 pts each) with history floor.
 *  Mirrors mobile _buildReadinessPillar.
 *
 *  Signals:
 *   +25  hasWeekIncome            -- income entries exist this week
 *   +25  hasWeekExpenses          -- expense entries exist this week
 *   +round(categoryCoverage x 25) -- fraction of week expenses categorised
 *   +25  reportSetupAcknowledged  -- tax setup decision recorded
 *
 *  Floor: if score is 0 but hasAnyHistory, floor to 30.
 *  All signals absent -> neutral 70. */
export function calcReadinessScore(
  hasWeekIncome: boolean,
  hasWeekExpenses: boolean,
  hasAnyHistory: boolean,
  reportSetupAcknowledged: boolean,
  categoryCoverage: number,
): number {
  // No-data fallback
  if (!hasWeekIncome && !hasWeekExpenses && !hasAnyHistory && !reportSetupAcknowledged) {
    return 70
  }

  let score = 0
  if (hasWeekIncome)           score += 25
  if (hasWeekExpenses)         score += 25
  score += Math.round(categoryCoverage * 25)
  if (reportSetupAcknowledged) score += 25

  // Floor: history exists but nothing this week -> keep sensible minimum
  if (score === 0 && hasAnyHistory) score = 30

  return Math.max(0, Math.min(100, score))
}

// --- Grade helpers -----------------------------------------------------------

/** Map 0-100 score to letter grade matching mobile's _gradeFor(). */
export function scoreToGradeLabel(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 85) return 'A-'
  if (score >= 80) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'NA'
}

/** Map 0-100 score to hex colour matching mobile's _scoreColor(). */
export function scoreToLevelColor(score: number): string {
  if (score >= 85) return '#55CC94'  // semantic success green
  if (score >= 70) return '#3DD6B0'  // secondary teal
  if (score >= 50) return '#F2AA4C'  // semantic warning amber
  return '#FF5C7A'                    // semantic danger red
}

function buildSummary(score: number, input: CompassInput): string {
  if (input.weekIncome === 0 && input.weekActiveDays === 0 && !input.hasAnyHistory)
    return 'Start logging income in the app to build your Compass score.'
  if (score >= 80)
    return 'Excellent momentum -- income is consistent and goals are progressing well.'
  if (score >= 60)
    return 'Good rhythm in place with room to improve consistency and goal tracking.'
  if (score >= 40)
    return 'Getting started -- keep logging daily to build your score.'
  return 'Set a goal and log your first income entries to unlock your full Compass.'
}

// --- Signal builders ---------------------------------------------------------

function buildSignals(
  input:   CompassInput,
  pillars: CompassPillarScores,
): { positive: string[]; improvement: string[] } {
  const positive:    string[] = []
  const improvement: string[] = []

  // Positive
  if (input.goalPaceStatus === 'ahead')
    positive.push('Goal is tracking ahead of schedule')

  if (input.weekActiveDays >= 3)
    positive.push(`${input.weekActiveDays} income ${input.weekActiveDays === 1 ? 'day' : 'days'} logged this week`)

  if (input.weekIncome > 0 && pillars.expenses >= 75)
    positive.push('Expenses well managed relative to income')

  if (input.reportSetupAcknowledged)
    positive.push('Tax reporting setup is complete')

  if (input.categoryCoverage >= 0.8 && input.weekExpenseCount > 0)
    positive.push('Expenses are well categorised this week')

  if (positive.length === 0 && input.weekIncome > 0)
    positive.push('Income activity recorded this week')

  // Improvement
  if (input.goalPaceStatus === null)
    improvement.push('Set a monthly income goal in the app to track pace')
  else if (input.goalPaceStatus === 'behind')
    improvement.push('Goal is behind target -- increase logging frequency')

  if (input.weekActiveDays < 2)
    improvement.push('Log income more consistently to build weekly rhythm')

  if (input.weekIncome > 0 && pillars.expenses < 55)
    improvement.push('High expenses are reducing net income position')

  if (!input.reportSetupAcknowledged)
    improvement.push('Complete tax setup in the app to unlock readiness signals')

  if (input.weekIncome === 0)
    improvement.push('No income logged this week -- open the app to start')

  return { positive, improvement }
}

// --- Main export -------------------------------------------------------------

export function computeCompassScore(input: CompassInput): CompassData {
  // Guard NaN/Infinity
  const safeNum = (v: number) => (Number.isFinite(v) ? v : 0)
  const safeArr = (arr: number[]) =>
    (arr ?? []).map(v => (Number.isFinite(v) ? Math.max(0, v) : 0))

  const weekIncome     = safeNum(input.weekIncome)
  const weekExpenses   = safeNum(input.weekExpenses)
  const weekActiveDays =
    Math.max(0, Math.min(7, Math.round(safeNum(input.weekActiveDays))))
  const weekDailyAmounts   = safeArr(input.weekDailyAmounts)
  const categoryCoverage   = Math.max(0, Math.min(1, safeNum(input.categoryCoverage)))
  const weekExpenseCount   = Math.max(0, Math.round(safeNum(input.weekExpenseCount)))

  const safeInput: CompassInput = {
    weekIncome,
    weekExpenses,
    weekActiveDays,
    weekDailyAmounts,
    hasAnyHistory:           Boolean(input.hasAnyHistory),
    reportSetupAcknowledged: Boolean(input.reportSetupAcknowledged),
    categoryCoverage,
    weekExpenseCount,
    goalPaceStatus:          input.goalPaceStatus ?? null,
  }

  const pillars: CompassPillarScores = {
    pace:        calcPaceScore(safeInput.goalPaceStatus),
    hourly:      calcHourlyScore(),
    consistency: calcConsistencyScore(safeInput.weekActiveDays, safeInput.weekDailyAmounts),
    expenses:    calcExpensesScore(safeInput.weekIncome, safeInput.weekExpenses),
    readiness:   calcReadinessScore(
                   safeInput.weekIncome > 0,
                   safeInput.weekExpenseCount > 0,
                   safeInput.hasAnyHistory,
                   safeInput.reportSetupAcknowledged,
                   safeInput.categoryCoverage,
                 ),
  }

  // Weighted sum: Pace 25%, Hourly 20%, Consistency 20%, Expenses 20%, Readiness 15%
  const rawScore =
    pillars.pace        * 0.25 +
    pillars.hourly      * 0.20 +
    pillars.consistency * 0.20 +
    pillars.expenses    * 0.20 +
    pillars.readiness   * 0.15

  const score = Math.round(Math.max(0, Math.min(100, rawScore || 0)))

  const { positive, improvement } = buildSignals(safeInput, pillars)

  return {
    score,
    gradeLabel:         scoreToGradeLabel(score),
    levelColor:         scoreToLevelColor(score),
    summary:            buildSummary(score, safeInput),
    positiveSignals:    positive,
    improvementSignals: improvement,
    pillarScores:       pillars,
  }
}
