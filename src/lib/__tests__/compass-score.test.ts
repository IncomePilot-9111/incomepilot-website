/**
 * Tests for compass-score.ts v2.
 *
 * Verifies each pillar calculator independently, then verifies the composite
 * computeCompassScore() -- including the critical no-data fallback (score=70).
 */
import { describe, it, expect } from 'vitest'
import {
  calcPaceScore,
  calcHourlyScore,
  calcConsistencyScore,
  calcExpensesScore,
  calcReadinessScore,
  scoreToGradeLabel,
  scoreToLevelColor,
  computeCompassScore,
} from '../compass-score'
import type { CompassInput } from '../compass-score'

// Helper: zeroed CompassInput -- all no-data state
const ZERO_INPUT: CompassInput = {
  weekIncome:              0,
  weekExpenses:            0,
  weekActiveDays:          0,
  weekDailyAmounts:        [],
  hasAnyHistory:           false,
  reportSetupAcknowledged: false,
  categoryCoverage:        0,
  weekExpenseCount:        0,
  goalPaceStatus:          null,
}

// ---------------------------------------------------------------------------
// calcPaceScore
// ---------------------------------------------------------------------------
describe('calcPaceScore', () => {
  it('returns 70 for null (no active goal -- mobile no-forecast fallback)', () => {
    expect(calcPaceScore(null)).toBe(70)
  })

  it('returns 95 for ahead', () => {
    expect(calcPaceScore('ahead')).toBe(95)
  })

  it('returns 80 for onPace', () => {
    expect(calcPaceScore('onPace')).toBe(80)
  })

  it('returns 50 for behind', () => {
    expect(calcPaceScore('behind')).toBe(50)
  })
})

// ---------------------------------------------------------------------------
// calcHourlyScore
// ---------------------------------------------------------------------------
describe('calcHourlyScore', () => {
  it('always returns 70 (constant fallback -- no Supabase WorkHub data)', () => {
    expect(calcHourlyScore()).toBe(70)
  })
})

// ---------------------------------------------------------------------------
// calcConsistencyScore
// ---------------------------------------------------------------------------
describe('calcConsistencyScore', () => {
  it('returns 70 when weekActiveDays is 0 (no-data fallback)', () => {
    expect(calcConsistencyScore(0, [])).toBe(70)
  })

  it('returns 70 when weekActiveDays is 0 regardless of amounts', () => {
    expect(calcConsistencyScore(0, [100, 200])).toBe(70)
  })

  it('floors at 30 for a single active day', () => {
    // coverage = 1/7 ~= 14.3, dispersion = 0 (single point) -> raw ~14.3 -> clamp to 30
    expect(calcConsistencyScore(1, [500])).toBe(30)
  })

  it('floors at 30 for 2 active days with equal amounts (no variance penalty)', () => {
    // coverage = 2/7 ~= 28.6, dispersion = 0 -> raw ~28.6 -> clamp to 30
    expect(calcConsistencyScore(2, [400, 400])).toBe(30)
  })

  it('gives ~43 for 3 days equal amounts (no variance)', () => {
    // coverage = 3/7 ~= 42.9, dispersion = 0 -> raw ~42.9 -> round to 43
    expect(calcConsistencyScore(3, [300, 300, 300])).toBe(43)
  })

  it('gives 100 for 7 active days with equal amounts', () => {
    // coverage = 7/7 = 1.0, dispersion = 0 -> raw = 100
    expect(calcConsistencyScore(7, [200, 200, 200, 200, 200, 200, 200])).toBe(100)
  })

  it('applies variance penalty correctly', () => {
    // 5 active days, amounts [100, 100, 100, 100, 400]
    // coverage = 5/7 ~= 71.4
    // mean = 160, stdDev = sqrt((3600*4+57600)/5) = sqrt(72000/5+... wait
    // mean = (100+100+100+100+400)/5 = 800/5 = 160
    // variance = ((60^2*4) + (240^2)) / 5 = (14400+57600)/5 = 72000/5 = 14400
    // stdDev = 120
    // dispersion = min(2, 120/160) = min(2, 0.75) = 0.75
    // raw = 71.4 - (0.75/2)*20 = 71.4 - 7.5 = 63.9 -> 64
    const score = calcConsistencyScore(5, [100, 100, 100, 100, 400])
    expect(score).toBe(64)
  })

  it('clamps dispersion at 2 for extreme variance', () => {
    // 2 active days: [1, 1000]
    // coverage = 2/7 ~= 28.6
    // mean = 500.5, stdDev ~= 499.5, dispersion = min(2, 499.5/500.5) ~= min(2, 0.998) = 0.998
    // raw = 28.6 - (0.998/2)*20 = 28.6 - 9.98 = 18.6 -> clamp to 30
    expect(calcConsistencyScore(2, [1, 1000])).toBe(30)
  })
})

// ---------------------------------------------------------------------------
// calcExpensesScore
// ---------------------------------------------------------------------------
describe('calcExpensesScore', () => {
  it('returns 70 when weekIncome is 0 (no-data fallback)', () => {
    expect(calcExpensesScore(0, 0)).toBe(70)
  })

  it('returns 70 when weekIncome is negative', () => {
    expect(calcExpensesScore(-100, 0)).toBe(70)
  })

  it('returns 90 for ratio < 0.15', () => {
    expect(calcExpensesScore(1000, 100)).toBe(90)   // 10%
    expect(calcExpensesScore(1000, 149)).toBe(90)   // 14.9%
  })

  it('returns 75 for ratio 0.15-0.30', () => {
    expect(calcExpensesScore(1000, 150)).toBe(75)   // 15%
    expect(calcExpensesScore(1000, 299)).toBe(75)   // 29.9%
  })

  it('returns 55 for ratio 0.30-0.50', () => {
    expect(calcExpensesScore(1000, 300)).toBe(55)   // 30%
    expect(calcExpensesScore(1000, 499)).toBe(55)   // 49.9%
  })

  it('returns 35 for ratio >= 0.50', () => {
    expect(calcExpensesScore(1000, 500)).toBe(35)   // 50%
    expect(calcExpensesScore(1000, 900)).toBe(35)   // 90%
  })
})

// ---------------------------------------------------------------------------
// calcReadinessScore
// ---------------------------------------------------------------------------
describe('calcReadinessScore', () => {
  it('returns 70 when all signals are absent (no-data fallback)', () => {
    expect(calcReadinessScore(false, false, false, false, 0)).toBe(70)
  })

  it('returns 30 floor when score=0 but hasAnyHistory', () => {
    expect(calcReadinessScore(false, false, true, false, 0)).toBe(30)
  })

  it('adds 25 for hasWeekIncome', () => {
    expect(calcReadinessScore(true, false, false, false, 0)).toBe(25)
  })

  it('adds 25 for hasWeekExpenses', () => {
    expect(calcReadinessScore(false, true, false, false, 0)).toBe(25)
  })

  it('adds 25 for reportSetupAcknowledged', () => {
    expect(calcReadinessScore(false, false, false, true, 0)).toBe(25)
  })

  it('returns 70 (no-data fallback) even when categoryCoverage is set but all booleans are false', () => {
    // No-data check only tests the 4 boolean flags, not categoryCoverage.
    // With all booleans false -> falls into no-data fallback -> 70.
    expect(calcReadinessScore(false, false, false, false, 0.8)).toBe(70)
  })

  it('adds categoryCoverage x 25 rounded when some signals are present', () => {
    // hasWeekIncome=true, so no-data check does NOT trigger.
    // score = 25 (income) + round(0.8 * 25) = 25 + 20 = 45
    expect(calcReadinessScore(true, false, false, false, 0.8)).toBe(45)
  })

  it('full score = 100 with all signals + full coverage', () => {
    expect(calcReadinessScore(true, true, true, true, 1.0)).toBe(100)
  })

  it('mixed: income + setup + partial coverage', () => {
    // hasWeekIncome=25, hasWeekExpenses=0, reportSetup=25, categoryCoverage=0.6->15 => 65
    expect(calcReadinessScore(true, false, false, true, 0.6)).toBe(65)
  })

  it('clamps at 100', () => {
    expect(calcReadinessScore(true, true, true, true, 1.0)).toBe(100)
  })
})

// ---------------------------------------------------------------------------
// scoreToGradeLabel
// ---------------------------------------------------------------------------
describe('scoreToGradeLabel', () => {
  it('returns A for score >= 90', () => {
    expect(scoreToGradeLabel(90)).toBe('A')
    expect(scoreToGradeLabel(100)).toBe('A')
    expect(scoreToGradeLabel(95)).toBe('A')
  })

  it('returns A- for 85-89', () => {
    expect(scoreToGradeLabel(85)).toBe('A-')
    expect(scoreToGradeLabel(89)).toBe('A-')
  })

  it('returns B+ for 80-84', () => {
    expect(scoreToGradeLabel(80)).toBe('B+')
    expect(scoreToGradeLabel(84)).toBe('B+')
  })

  it('returns B for 70-79', () => {
    expect(scoreToGradeLabel(70)).toBe('B')
    expect(scoreToGradeLabel(79)).toBe('B')
  })

  it('returns C for 60-69', () => {
    expect(scoreToGradeLabel(60)).toBe('C')
    expect(scoreToGradeLabel(69)).toBe('C')
  })

  it('returns D for 50-59', () => {
    expect(scoreToGradeLabel(50)).toBe('D')
    expect(scoreToGradeLabel(59)).toBe('D')
  })

  it('returns NA for < 50', () => {
    expect(scoreToGradeLabel(49)).toBe('NA')
    expect(scoreToGradeLabel(0)).toBe('NA')
  })
})

// ---------------------------------------------------------------------------
// scoreToLevelColor
// ---------------------------------------------------------------------------
describe('scoreToLevelColor', () => {
  it('returns success green for >= 85', () => {
    expect(scoreToLevelColor(85)).toBe('#55CC94')
    expect(scoreToLevelColor(100)).toBe('#55CC94')
  })

  it('returns secondary teal for 70-84', () => {
    expect(scoreToLevelColor(70)).toBe('#3DD6B0')
    expect(scoreToLevelColor(84)).toBe('#3DD6B0')
  })

  it('returns warning amber for 50-69', () => {
    expect(scoreToLevelColor(50)).toBe('#F2AA4C')
    expect(scoreToLevelColor(69)).toBe('#F2AA4C')
  })

  it('returns danger red for < 50', () => {
    expect(scoreToLevelColor(49)).toBe('#FF5C7A')
    expect(scoreToLevelColor(0)).toBe('#FF5C7A')
  })
})

// ---------------------------------------------------------------------------
// computeCompassScore -- critical: no-data fallback must be 70
// ---------------------------------------------------------------------------
describe('computeCompassScore -- no-data fallback', () => {
  it('returns score=70 when all inputs are zeroed (matches mobile fallback exactly)', () => {
    const result = computeCompassScore(ZERO_INPUT)
    expect(result.score).toBe(70)
  })

  it('returns gradeLabel=B for score=70', () => {
    const result = computeCompassScore(ZERO_INPUT)
    expect(result.gradeLabel).toBe('B')
  })

  it('returns secondary teal color for score=70', () => {
    const result = computeCompassScore(ZERO_INPUT)
    expect(result.levelColor).toBe('#3DD6B0')
  })

  it('returns no-data summary when weekIncome=0 and !hasAnyHistory', () => {
    const result = computeCompassScore(ZERO_INPUT)
    expect(result.summary).toContain('Start logging income')
  })

  it('includes improvement signal to log income when weekIncome=0', () => {
    const result = computeCompassScore(ZERO_INPUT)
    expect(result.improvementSignals.some(s => s.includes('No income logged'))).toBe(true)
  })

  it('all individual pillars are 70 for zeroed input', () => {
    const result = computeCompassScore(ZERO_INPUT)
    expect(result.pillarScores.pace).toBe(70)
    expect(result.pillarScores.hourly).toBe(70)
    expect(result.pillarScores.consistency).toBe(70)
    expect(result.pillarScores.expenses).toBe(70)
    expect(result.pillarScores.readiness).toBe(70)
  })
})

// ---------------------------------------------------------------------------
// computeCompassScore -- goal pace integration
// ---------------------------------------------------------------------------
describe('computeCompassScore -- goal pace', () => {
  it('ahead goal raises pace pillar to 95', () => {
    const result = computeCompassScore({ ...ZERO_INPUT, goalPaceStatus: 'ahead' })
    expect(result.pillarScores.pace).toBe(95)
  })

  it('behind goal lowers pace pillar to 50', () => {
    const result = computeCompassScore({ ...ZERO_INPUT, goalPaceStatus: 'behind' })
    expect(result.pillarScores.pace).toBe(50)
  })

  it('null goal returns neutral pace 70', () => {
    const result = computeCompassScore({ ...ZERO_INPUT, goalPaceStatus: null })
    expect(result.pillarScores.pace).toBe(70)
  })
})

// ---------------------------------------------------------------------------
// computeCompassScore -- composite score verification
// ---------------------------------------------------------------------------
describe('computeCompassScore -- composite score', () => {
  it('full data: all pillars at max produces score=90 (hourly capped at 70)', () => {
    // Best case: ahead goal (95), hourly=70 (constant), 7 active days equal (100),
    // very low expenses (90), full readiness (100)
    // raw = 95*0.25 + 70*0.20 + 100*0.20 + 90*0.20 + 100*0.15
    // = 23.75 + 14 + 20 + 18 + 15 = 90.75 -> 91
    const input: CompassInput = {
      weekIncome:              1000,
      weekExpenses:            50,   // 5% ratio -> 90
      weekActiveDays:          7,
      weekDailyAmounts:        [143, 143, 143, 143, 143, 143, 142],
      hasAnyHistory:           true,
      reportSetupAcknowledged: true,
      categoryCoverage:        1.0,
      weekExpenseCount:        3,
      goalPaceStatus:          'ahead',
    }
    const result = computeCompassScore(input)
    expect(result.score).toBe(91)
    expect(result.gradeLabel).toBe('A')
    expect(result.levelColor).toBe('#55CC94')
  })

  it('partial data: onPace goal, 3 active days, low expenses, income only readiness', () => {
    // pace=80, hourly=70, consistency~=43, expenses=90, readiness=25 (income only)
    // weekExpenseCount=0 -> hasWeekExpenses=false -> readiness score = 25 (income only)
    // raw = 80*0.25 + 70*0.20 + 43*0.20 + 90*0.20 + 25*0.15
    // = 20 + 14 + 8.6 + 18 + 3.75 = 64.35 -> 64
    const input: CompassInput = {
      weekIncome:              900,
      weekExpenses:            50,
      weekActiveDays:          3,
      weekDailyAmounts:        [300, 300, 300],
      hasAnyHistory:           false,
      reportSetupAcknowledged: false,
      categoryCoverage:        0,
      weekExpenseCount:        0,   // no expense entries -> hasWeekExpenses=false
      goalPaceStatus:          'onPace',
    }
    const result = computeCompassScore(input)
    expect(result.score).toBe(64)
    expect(result.gradeLabel).toBe('C')
  })

  it('guard: NaN input is treated as 0', () => {
    const input: CompassInput = {
      weekIncome:              NaN,
      weekExpenses:            NaN,
      weekActiveDays:          NaN,
      weekDailyAmounts:        [NaN, 100],
      hasAnyHistory:           false,
      reportSetupAcknowledged: false,
      categoryCoverage:        NaN,
      weekExpenseCount:        NaN,
      goalPaceStatus:          null,
    }
    const result = computeCompassScore(input)
    expect(Number.isFinite(result.score)).toBe(true)
    expect(result.score).toBe(70)
  })

  it('guard: undefined weekDailyAmounts is handled gracefully', () => {
    const input = { ...ZERO_INPUT, weekDailyAmounts: undefined as unknown as number[] }
    expect(() => computeCompassScore(input)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// computeCompassScore -- positive signals
// ---------------------------------------------------------------------------
describe('computeCompassScore -- signals', () => {
  it('includes "ahead of schedule" signal when goalPaceStatus is ahead', () => {
    const result = computeCompassScore({ ...ZERO_INPUT, goalPaceStatus: 'ahead', weekIncome: 500, weekActiveDays: 1, weekDailyAmounts: [500] })
    expect(result.positiveSignals.some(s => s.includes('ahead of schedule'))).toBe(true)
  })

  it('includes active-days signal when weekActiveDays >= 3', () => {
    const result = computeCompassScore({ ...ZERO_INPUT, weekIncome: 300, weekActiveDays: 4, weekDailyAmounts: [75, 75, 75, 75] })
    expect(result.positiveSignals.some(s => s.includes('4 income days'))).toBe(true)
  })

  it('includes "Set a monthly income goal" improvement when goalPaceStatus is null', () => {
    const result = computeCompassScore(ZERO_INPUT)
    expect(result.improvementSignals.some(s => s.includes('Set a monthly income goal'))).toBe(true)
  })

  it('includes "Complete tax setup" improvement when reportSetupAcknowledged is false', () => {
    const result = computeCompassScore({ ...ZERO_INPUT, weekIncome: 500 })
    expect(result.improvementSignals.some(s => s.includes('Complete tax setup'))).toBe(true)
  })
})
