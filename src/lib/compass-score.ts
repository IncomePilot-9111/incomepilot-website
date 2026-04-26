/**
 * Web-safe Compass Score computation.
 *
 * Adapted from the PolarisPilot mobile app's 5-pillar scoring system for
 * use with cloud Supabase data. This is NOT a port of the local-first SQLite
 * code -- it is a server-side re-derivation using the same conceptual pillars
 * applied to cloud-synced data.
 *
 * Reference: flutter_application_1/lib/data/compass_insights_summary.dart
 * (read-only reference, not copied)
 *
 * 5 pillars (weights sum to 1.0):
 *   Pace         25% -- goal progress % vs this month's target
 *   Consistency  25% -- distinct days with income logged in last 7 days
 *   Expenses     20% -- expense ratio (expenses / income, this month)
 *   Modules      15% -- count of active income platforms
 *   Activity     15% -- total XP earned (proxy for engagement depth)
 *
 * Level labels (0-100 scale):
 *   80-100  Strong Momentum
 *   60-79   On Track
 *   40-59   Building Rhythm
 *   0-39    Getting Started
 *
 * All functions are pure and deterministic. Safe to call with zeroed inputs.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompassInput {
  /** Month-to-date gross income (AUD) */
  totalIncome:     number
  /** Month-to-date total expenses (AUD) */
  totalExpenses:   number
  /** Count of distinct enabled modules in workspace_preferences */
  modulesCount:    number
  /** goal_plans.current_amount / target_amount * 100, or null if no active goal */
  goalProgressPct: number | null
  /** Sum of premium_xp_ledger.amount for this user */
  totalXp:         number
  /** Count of days with at least one income entry in the last 7 days */
  activeDaysLast7: number
}

export interface CompassPillarScores {
  goalPace:    number  // 0-100
  consistency: number  // 0-100
  expenses:    number  // 0-100
  modules:     number  // 0-100
  activity:    number  // 0-100
}

export interface CompassData {
  score:              number          // 0-100 integer
  levelLabel:         string          // "Getting Started" | "Building Rhythm" | "On Track" | "Strong Momentum"
  levelColor:         string          // hex accent colour matching level
  summary:            string          // one sentence for the hero card
  positiveSignals:    string[]        // what is working well
  improvementSignals: string[]        // what to focus on
  pillarScores:       CompassPillarScores
}

// ─── Pillar calculators (pure, return 0-100) ──────────────────────────────────

/** Pace: how well goal progress tracks the target */
export function calcPaceScore(goalProgressPct: number | null): number {
  if (goalProgressPct === null) return 50  // neutral -- no goal set
  if (goalProgressPct >= 100) return 100
  if (goalProgressPct >= 80)  return 90
  if (goalProgressPct >= 60)  return 75
  if (goalProgressPct >= 40)  return 60
  if (goalProgressPct >= 20)  return 45
  return 30
}

/** Consistency: frequency of income logging over the last 7 days */
export function calcConsistencyScore(activeDays: number): number {
  if (activeDays >= 5) return 90
  if (activeDays >= 3) return 70
  if (activeDays >= 2) return 50
  if (activeDays >= 1) return 35
  return 15
}

/** Expenses: ratio of expenses to income (lower ratio = better) */
export function calcExpensesScore(totalIncome: number, totalExpenses: number): number {
  if (totalIncome <= 0) return 50  // neutral -- no income data yet
  const ratio = totalExpenses / totalIncome
  if (ratio < 0.15) return 90
  if (ratio < 0.30) return 75
  if (ratio < 0.50) return 55
  if (ratio < 0.75) return 35
  return 20
}

/** Modules: breadth of active income platforms tracked */
export function calcModulesScore(count: number): number {
  if (count >= 3) return 90
  if (count >= 2) return 75
  if (count >= 1) return 55
  return 30
}

/** Activity: total XP accumulated (reflects depth of engagement) */
export function calcActivityScore(totalXp: number): number {
  if (totalXp >= 1000) return 90
  if (totalXp >= 500)  return 75
  if (totalXp >= 100)  return 55
  if (totalXp >= 1)    return 40
  return 25
}

// ─── Level helpers ────────────────────────────────────────────────────────────

export function scoreToLevelLabel(score: number): string {
  if (score >= 80) return 'Strong Momentum'
  if (score >= 60) return 'On Track'
  if (score >= 40) return 'Building Rhythm'
  return 'Getting Started'
}

export function scoreToLevelColor(score: number): string {
  if (score >= 80) return '#3DD6B0'
  if (score >= 60) return '#5EE4C0'
  if (score >= 40) return '#60C8F5'
  return '#F59E6A'
}

function buildSummary(score: number, input: CompassInput): string {
  if (input.totalIncome === 0 && input.activeDaysLast7 === 0)
    return 'Start logging income in the app to build your Compass score.'
  if (score >= 80)
    return 'Excellent momentum -- income is consistent and goals are progressing well.'
  if (score >= 60)
    return 'Good rhythm in place with room to improve consistency and goal tracking.'
  if (score >= 40)
    return 'Getting started -- keep logging daily to build your score.'
  return 'Set a goal and log your first income entries to unlock your full Compass.'
}

// ─── Signal builders ──────────────────────────────────────────────────────────

function buildSignals(
  input:   CompassInput,
  pillars: CompassPillarScores,
): { positive: string[]; improvement: string[] } {
  const positive:    string[] = []
  const improvement: string[] = []

  // ── Positive ───────────────────────────────────────────────────────────────
  if (input.goalProgressPct !== null && pillars.goalPace >= 75)
    positive.push('Goal is tracking ahead of schedule')

  if (input.activeDaysLast7 >= 3)
    positive.push(`${input.activeDaysLast7} income ${input.activeDaysLast7 === 1 ? 'day' : 'days'} logged this week`)

  if (input.totalIncome > 0 && pillars.expenses >= 75)
    positive.push('Expenses well managed relative to income')

  if (input.modulesCount >= 2)
    positive.push(`${input.modulesCount} income platforms actively tracked`)

  if (input.totalXp >= 100)
    positive.push('XP momentum building -- great engagement')

  if (positive.length === 0 && input.totalIncome > 0)
    positive.push('Income activity recorded this month')

  // ── Improvement ────────────────────────────────────────────────────────────
  if (input.goalProgressPct === null)
    improvement.push('Set a monthly income goal in the app to track pace')
  else if (pillars.goalPace < 50)
    improvement.push('Goal is behind target -- increase logging frequency')

  if (input.activeDaysLast7 < 2)
    improvement.push('Log income more consistently to build weekly rhythm')

  if (input.totalIncome > 0 && pillars.expenses < 55)
    improvement.push('High expenses are reducing net income position')

  if (input.modulesCount < 2)
    improvement.push('Track more income sources across additional modules')

  if (input.totalIncome === 0)
    improvement.push('No income logged this month -- open the app to start')

  return { positive, improvement }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function computeCompassScore(input: CompassInput): CompassData {
  const pillars: CompassPillarScores = {
    goalPace:    calcPaceScore(input.goalProgressPct),
    consistency: calcConsistencyScore(input.activeDaysLast7),
    expenses:    calcExpensesScore(input.totalIncome, input.totalExpenses),
    modules:     calcModulesScore(input.modulesCount),
    activity:    calcActivityScore(input.totalXp),
  }

  const rawScore =
    pillars.goalPace    * 0.25 +
    pillars.consistency * 0.25 +
    pillars.expenses    * 0.20 +
    pillars.modules     * 0.15 +
    pillars.activity    * 0.15

  const score = Math.round(Math.max(0, Math.min(100, rawScore)))

  const { positive, improvement } = buildSignals(input, pillars)

  return {
    score,
    levelLabel:         scoreToLevelLabel(score),
    levelColor:         scoreToLevelColor(score),
    summary:            buildSummary(score, input),
    positiveSignals:    positive,
    improvementSignals: improvement,
    pillarScores:       pillars,
  }
}
