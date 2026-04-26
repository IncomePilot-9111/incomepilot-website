/**
 * Unit tests for src/lib/compass-score.ts
 *
 * Covers all exported pure functions independently, then verifies the
 * composite computeCompassScore output for representative inputs.
 */
import { describe, it, expect } from 'vitest'
import {
  calcPaceScore,
  calcConsistencyScore,
  calcExpensesScore,
  calcModulesScore,
  calcActivityScore,
  scoreToLevelLabel,
  scoreToLevelColor,
  computeCompassScore,
} from '../compass-score'

// ─── calcPaceScore ────────────────────────────────────────────────────────────

describe('calcPaceScore', () => {
  it('returns 50 (neutral) when no goal is set (null)', () => {
    expect(calcPaceScore(null)).toBe(50)
  })

  it('returns 100 at exactly 100% progress', () => {
    expect(calcPaceScore(100)).toBe(100)
  })

  it('returns 100 when progress exceeds 100%', () => {
    expect(calcPaceScore(120)).toBe(100)
  })

  it('returns 90 at 80% progress', () => {
    expect(calcPaceScore(80)).toBe(90)
  })

  it('returns 75 at 60% progress', () => {
    expect(calcPaceScore(60)).toBe(75)
  })

  it('returns 60 at 40% progress', () => {
    expect(calcPaceScore(40)).toBe(60)
  })

  it('returns 45 at 20% progress', () => {
    expect(calcPaceScore(20)).toBe(45)
  })

  it('returns 30 below 20% progress', () => {
    expect(calcPaceScore(10)).toBe(30)
    expect(calcPaceScore(0)).toBe(30)
  })
})

// ─── calcConsistencyScore ─────────────────────────────────────────────────────

describe('calcConsistencyScore', () => {
  it('returns 15 for 0 active days', () => {
    expect(calcConsistencyScore(0)).toBe(15)
  })

  it('returns 35 for 1 active day', () => {
    expect(calcConsistencyScore(1)).toBe(35)
  })

  it('returns 50 for 2 active days', () => {
    expect(calcConsistencyScore(2)).toBe(50)
  })

  it('returns 70 for 3 active days', () => {
    expect(calcConsistencyScore(3)).toBe(70)
  })

  it('returns 70 for 4 active days (below 5-day threshold)', () => {
    expect(calcConsistencyScore(4)).toBe(70)
  })

  it('returns 90 for 5 or more active days', () => {
    expect(calcConsistencyScore(5)).toBe(90)
    expect(calcConsistencyScore(7)).toBe(90)
  })
})

// ─── calcExpensesScore ────────────────────────────────────────────────────────

describe('calcExpensesScore', () => {
  it('returns 50 (neutral) when income is 0', () => {
    expect(calcExpensesScore(0, 0)).toBe(50)
    expect(calcExpensesScore(0, 500)).toBe(50)
  })

  it('returns 90 when expense ratio is below 15%', () => {
    expect(calcExpensesScore(1000, 100)).toBe(90)  // 10%
    expect(calcExpensesScore(1000, 0)).toBe(90)    // 0%
  })

  it('returns 75 when expense ratio is 15-29%', () => {
    expect(calcExpensesScore(1000, 200)).toBe(75)  // 20%
    expect(calcExpensesScore(1000, 290)).toBe(75)  // 29%
  })

  it('returns 55 when expense ratio is 30-49%', () => {
    expect(calcExpensesScore(1000, 400)).toBe(55)  // 40%
  })

  it('returns 35 when expense ratio is 50-74%', () => {
    expect(calcExpensesScore(1000, 600)).toBe(35)  // 60%
  })

  it('returns 20 when expense ratio is 75% or more', () => {
    expect(calcExpensesScore(1000, 800)).toBe(20)   // 80%
    expect(calcExpensesScore(1000, 1500)).toBe(20)  // 150%
  })
})

// ─── calcModulesScore ─────────────────────────────────────────────────────────

describe('calcModulesScore', () => {
  it('returns 30 for 0 active modules', () => {
    expect(calcModulesScore(0)).toBe(30)
  })

  it('returns 55 for 1 module', () => {
    expect(calcModulesScore(1)).toBe(55)
  })

  it('returns 75 for 2 modules', () => {
    expect(calcModulesScore(2)).toBe(75)
  })

  it('returns 90 for 3 or more modules', () => {
    expect(calcModulesScore(3)).toBe(90)
    expect(calcModulesScore(5)).toBe(90)
  })
})

// ─── calcActivityScore ────────────────────────────────────────────────────────

describe('calcActivityScore', () => {
  it('returns 25 for 0 XP', () => {
    expect(calcActivityScore(0)).toBe(25)
  })

  it('returns 40 for 1-99 XP', () => {
    expect(calcActivityScore(1)).toBe(40)
    expect(calcActivityScore(50)).toBe(40)
    expect(calcActivityScore(99)).toBe(40)
  })

  it('returns 55 for 100-499 XP', () => {
    expect(calcActivityScore(100)).toBe(55)
    expect(calcActivityScore(499)).toBe(55)
  })

  it('returns 75 for 500-999 XP', () => {
    expect(calcActivityScore(500)).toBe(75)
    expect(calcActivityScore(999)).toBe(75)
  })

  it('returns 90 for 1000+ XP', () => {
    expect(calcActivityScore(1000)).toBe(90)
    expect(calcActivityScore(5000)).toBe(90)
  })
})

// ─── scoreToLevelLabel ────────────────────────────────────────────────────────

describe('scoreToLevelLabel', () => {
  it('"Getting Started" for scores 0-39', () => {
    expect(scoreToLevelLabel(0)).toBe('Getting Started')
    expect(scoreToLevelLabel(39)).toBe('Getting Started')
  })

  it('"Building Rhythm" for scores 40-59', () => {
    expect(scoreToLevelLabel(40)).toBe('Building Rhythm')
    expect(scoreToLevelLabel(59)).toBe('Building Rhythm')
  })

  it('"On Track" for scores 60-79', () => {
    expect(scoreToLevelLabel(60)).toBe('On Track')
    expect(scoreToLevelLabel(79)).toBe('On Track')
  })

  it('"Strong Momentum" for scores 80-100', () => {
    expect(scoreToLevelLabel(80)).toBe('Strong Momentum')
    expect(scoreToLevelLabel(100)).toBe('Strong Momentum')
  })
})

// ─── scoreToLevelColor ────────────────────────────────────────────────────────

describe('scoreToLevelColor', () => {
  it('returns amber (#F59E6A) for score 0-39', () => {
    expect(scoreToLevelColor(0)).toBe('#F59E6A')
    expect(scoreToLevelColor(39)).toBe('#F59E6A')
  })

  it('returns blue (#60C8F5) for score 40-59', () => {
    expect(scoreToLevelColor(40)).toBe('#60C8F5')
    expect(scoreToLevelColor(59)).toBe('#60C8F5')
  })

  it('returns light teal (#5EE4C0) for score 60-79', () => {
    expect(scoreToLevelColor(60)).toBe('#5EE4C0')
    expect(scoreToLevelColor(79)).toBe('#5EE4C0')
  })

  it('returns teal (#3DD6B0) for score 80+', () => {
    expect(scoreToLevelColor(80)).toBe('#3DD6B0')
    expect(scoreToLevelColor(100)).toBe('#3DD6B0')
  })
})

// ─── computeCompassScore (composite) ─────────────────────────────────────────

describe('computeCompassScore', () => {
  it('returns a valid CompassData shape for zero inputs', () => {
    const result = computeCompassScore({
      totalIncome: 0, totalExpenses: 0, modulesCount: 0,
      goalProgressPct: null, totalXp: 0, activeDaysLast7: 0,
    })

    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('levelLabel')
    expect(result).toHaveProperty('levelColor')
    expect(result).toHaveProperty('summary')
    expect(result).toHaveProperty('positiveSignals')
    expect(result).toHaveProperty('improvementSignals')
    expect(result).toHaveProperty('pillarScores')
    expect(typeof result.score).toBe('number')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('produces score of 35 for all-zero inputs', () => {
    // goalPace(null)=50 * 0.25 = 12.5
    // consistency(0)=15 * 0.25 = 3.75
    // expenses(0,0)=50 * 0.20 = 10
    // modules(0)=30  * 0.15 = 4.5
    // activity(0)=25 * 0.15 = 3.75
    // total = 34.5 → Math.round = 35
    const result = computeCompassScore({
      totalIncome: 0, totalExpenses: 0, modulesCount: 0,
      goalProgressPct: null, totalXp: 0, activeDaysLast7: 0,
    })
    expect(result.score).toBe(35)
  })

  it('produces score of 93 for an excellent profile', () => {
    // goalPace(100)=100, consistency(7)=90, expenses(1000,50)=90,
    // modules(3)=90, activity(2000)=90
    // = 100*0.25 + 90*0.25 + 90*0.20 + 90*0.15 + 90*0.15
    // = 25 + 22.5 + 18 + 13.5 + 13.5 = 92.5 → 93
    const result = computeCompassScore({
      totalIncome: 1000, totalExpenses: 50, modulesCount: 3,
      goalProgressPct: 100, totalXp: 2000, activeDaysLast7: 7,
    })
    expect(result.score).toBe(93)
    expect(result.levelLabel).toBe('Strong Momentum')
    expect(result.levelColor).toBe('#3DD6B0')
  })

  it('levelLabel and levelColor match zero-input score', () => {
    const result = computeCompassScore({
      totalIncome: 0, totalExpenses: 0, modulesCount: 0,
      goalProgressPct: null, totalXp: 0, activeDaysLast7: 0,
    })
    // score = 35 → Getting Started, amber
    expect(result.levelLabel).toBe('Getting Started')
    expect(result.levelColor).toBe('#F59E6A')
  })

  it('includes correct pillar scores for a mid-range input', () => {
    const result = computeCompassScore({
      totalIncome: 500, totalExpenses: 100, modulesCount: 2,
      goalProgressPct: 50, totalXp: 300, activeDaysLast7: 3,
    })
    expect(result.pillarScores).toEqual({
      goalPace:    60,  // calcPaceScore(50) -- >=40 branch
      consistency: 70,  // calcConsistencyScore(3) -- >=3 branch
      expenses:    75,  // calcExpensesScore(500,100) -- ratio=0.2 <0.30 branch
      modules:     75,  // calcModulesScore(2) -- >=2 branch
      activity:    55,  // calcActivityScore(300) -- >=100 branch
    })
  })

  it('returns starter summary when no income and no activity logged', () => {
    const result = computeCompassScore({
      totalIncome: 0, totalExpenses: 0, modulesCount: 0,
      goalProgressPct: null, totalXp: 0, activeDaysLast7: 0,
    })
    expect(result.summary).toBe('Start logging income in the app to build your Compass score.')
  })

  it('returns excellent summary when score >= 80', () => {
    const result = computeCompassScore({
      totalIncome: 1000, totalExpenses: 50, modulesCount: 3,
      goalProgressPct: 100, totalXp: 2000, activeDaysLast7: 7,
    })
    expect(result.summary).toContain('Excellent momentum')
  })

  it('positiveSignals and improvementSignals are always arrays', () => {
    const result = computeCompassScore({
      totalIncome: 100, totalExpenses: 10, modulesCount: 1,
      goalProgressPct: null, totalXp: 50, activeDaysLast7: 1,
    })
    expect(Array.isArray(result.positiveSignals)).toBe(true)
    expect(Array.isArray(result.improvementSignals)).toBe(true)
  })

  it('improvementSignals suggests setting a goal when goalProgressPct is null', () => {
    const result = computeCompassScore({
      totalIncome: 0, totalExpenses: 0, modulesCount: 0,
      goalProgressPct: null, totalXp: 0, activeDaysLast7: 0,
    })
    expect(result.improvementSignals.some(s => s.toLowerCase().includes('goal'))).toBe(true)
  })

  it('score is always an integer', () => {
    const inputs = [
      { totalIncome: 0, totalExpenses: 0, modulesCount: 0, goalProgressPct: null, totalXp: 0, activeDaysLast7: 0 },
      { totalIncome: 333, totalExpenses: 111, modulesCount: 1, goalProgressPct: 33, totalXp: 150, activeDaysLast7: 2 },
      { totalIncome: 1000, totalExpenses: 500, modulesCount: 2, goalProgressPct: 75, totalXp: 600, activeDaysLast7: 4 },
    ]
    for (const input of inputs) {
      expect(Number.isInteger(computeCompassScore(input).score)).toBe(true)
    }
  })

  it('score is clamped to 0-100', () => {
    // All-max input
    const high = computeCompassScore({
      totalIncome: 999999, totalExpenses: 0, modulesCount: 10,
      goalProgressPct: 100, totalXp: 999999, activeDaysLast7: 7,
    })
    expect(high.score).toBeLessThanOrEqual(100)
    expect(high.score).toBeGreaterThanOrEqual(0)
  })
})
