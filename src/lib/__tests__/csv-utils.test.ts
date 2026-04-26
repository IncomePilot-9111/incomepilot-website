/**
 * Tests for src/lib/csv-utils.ts
 *
 * Verifies CSV generation for all four export types and the escapeCSV helper.
 */
import { describe, it, expect } from 'vitest'
import {
  escapeCSV,
  incomeToCSV,
  expensesToCSV,
  goalsToCSV,
  accountantSummaryToCSV,
} from '../csv-utils'
import type { IncomeExportRow, ExpenseExportRow, GoalExportRow } from '../csv-utils'

// ─── escapeCSV ────────────────────────────────────────────────────────────────
describe('escapeCSV', () => {
  it('returns empty string for null', () => {
    expect(escapeCSV(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(escapeCSV(undefined)).toBe('')
  })

  it('returns plain string as-is when no special chars', () => {
    expect(escapeCSV('hello')).toBe('hello')
  })

  it('wraps in double quotes when value contains a comma', () => {
    expect(escapeCSV('hello, world')).toBe('"hello, world"')
  })

  it('wraps in double quotes when value contains a double quote', () => {
    expect(escapeCSV('say "hi"')).toBe('"say ""hi"""')
  })

  it('wraps in double quotes when value contains a newline', () => {
    expect(escapeCSV('line1\nline2')).toBe('"line1\nline2"')
  })

  it('converts numbers to string', () => {
    expect(escapeCSV(123.45)).toBe('123.45')
  })

  it('converts booleans to string', () => {
    expect(escapeCSV(true)).toBe('true')
  })
})

// ─── incomeToCSV ─────────────────────────────────────────────────────────────
describe('incomeToCSV', () => {
  it('produces header-only output for empty rows', () => {
    const csv = incomeToCSV([])
    expect(csv).toContain('Date')
    expect(csv).toContain('Gross Amount (AUD)')
    expect(csv.split('\n')).toHaveLength(1)
  })

  it('includes one data row per entry', () => {
    const rows: IncomeExportRow[] = [
      {
        entry_date:   '2024-06-01',
        source:       'rideshare',
        title:        'Uber trip',
        gross_amount: 120.50,
        net_amount:   110,
        amount:       null,
        platform:     'uber',
        status:       'received',
        notes_text:   null,
      },
    ]
    const csv = incomeToCSV(rows)
    expect(csv).toContain('2024-06-01')
    expect(csv).toContain('rideshare')
    expect(csv).toContain('120.5')
  })

  it('falls back to amount when gross_amount is null', () => {
    const rows: IncomeExportRow[] = [
      {
        entry_date:   '2024-06-02',
        source:       null,
        title:        null,
        gross_amount: null,
        net_amount:   null,
        amount:       75,
        platform:     null,
        status:       null,
        notes_text:   null,
      },
    ]
    const csv = incomeToCSV(rows)
    expect(csv).toContain('75')
  })

  it('handles null source and title gracefully', () => {
    const rows: IncomeExportRow[] = [
      { entry_date: '2024-01-01', source: null, title: null, gross_amount: 50, net_amount: null, amount: null, platform: null, status: null, notes_text: null },
    ]
    expect(() => incomeToCSV(rows)).not.toThrow()
  })
})

// ─── expensesToCSV ────────────────────────────────────────────────────────────
describe('expensesToCSV', () => {
  it('produces header-only output for empty rows', () => {
    const csv = expensesToCSV([])
    expect(csv).toContain('Date')
    expect(csv).toContain('Amount (AUD)')
    expect(csv.split('\n')).toHaveLength(1)
  })

  it('includes expense data correctly', () => {
    const rows: ExpenseExportRow[] = [
      {
        expense_date: '2024-06-05',
        amount:       45.99,
        category:     'fuel',
        item_name:    'Petrol',
        title:        null,
        status:       null,
        notes_text:   null,
      },
    ]
    const csv = expensesToCSV(rows)
    expect(csv).toContain('2024-06-05')
    expect(csv).toContain('45.99')
    expect(csv).toContain('fuel')
  })

  it('escapes commas in category names', () => {
    const rows: ExpenseExportRow[] = [
      { expense_date: '2024-01-01', amount: 10, category: 'food, drink', item_name: null, title: null, status: null, notes_text: null },
    ]
    const csv = expensesToCSV(rows)
    expect(csv).toContain('"food, drink"')
  })
})

// ─── goalsToCSV ───────────────────────────────────────────────────────────────
describe('goalsToCSV', () => {
  it('produces header-only output for empty rows', () => {
    const csv = goalsToCSV([])
    expect(csv).toContain('Title')
    expect(csv).toContain('Progress (%)')
    expect(csv.split('\n')).toHaveLength(1)
  })

  it('calculates progress percentage correctly', () => {
    const rows: GoalExportRow[] = [
      {
        title:          'June goal',
        target_amount:  1000,
        current_amount: 750,
        is_active:      true,
        status:         'active',
        module_type:    'rideshare',
        start_date:     '2024-06-01',
        end_date:       '2024-06-30',
        target_date:    null,
        completed_at:   null,
        created_at:     '2024-06-01T00:00:00Z',
      },
    ]
    const csv = goalsToCSV(rows)
    expect(csv).toContain('75')
    expect(csv).toContain('June goal')
    expect(csv).toContain('Yes')   // is_active = true
  })

  it('marks inactive goals as No', () => {
    const rows: GoalExportRow[] = [
      { title: 'Old goal', target_amount: 500, current_amount: 500, is_active: false, status: 'completed', module_type: null, start_date: null, end_date: null, target_date: null, completed_at: '2024-05-30T10:00:00Z', created_at: '2024-05-01T00:00:00Z' },
    ]
    const csv = goalsToCSV(rows)
    expect(csv).toContain('No')
  })

  it('handles null target_amount without dividing by zero', () => {
    const rows: GoalExportRow[] = [
      { title: 'Bad goal', target_amount: null, current_amount: null, is_active: false, status: null, module_type: null, start_date: null, end_date: null, target_date: null, completed_at: null, created_at: null },
    ]
    expect(() => goalsToCSV(rows)).not.toThrow()
    const csv = goalsToCSV(rows)
    expect(csv).toContain('0')
  })
})

// ─── accountantSummaryToCSV ───────────────────────────────────────────────────
describe('accountantSummaryToCSV', () => {
  const incomeRow: IncomeExportRow = { entry_date: '2024-06-01', source: 'rideshare', title: 'Trip', gross_amount: 200, net_amount: 180, amount: null, platform: null, status: null, notes_text: null }
  const expenseRow: ExpenseExportRow = { expense_date: '2024-06-02', amount: 50, category: 'fuel', item_name: null, title: null, status: null, notes_text: null }
  const goalRow: GoalExportRow = { title: 'Goal', target_amount: 1000, current_amount: 500, is_active: true, status: null, module_type: null, start_date: null, end_date: null, target_date: null, completed_at: null, created_at: null }

  it('includes section headers for all three datasets', () => {
    const csv = accountantSummaryToCSV([incomeRow], [expenseRow], [goalRow], '2024-06-15')
    expect(csv).toContain('INCOME ENTRIES')
    expect(csv).toContain('EXPENSE ENTRIES')
    expect(csv).toContain('GOALS SUMMARY')
  })

  it('includes total income and expenses in the summary header', () => {
    const csv = accountantSummaryToCSV([incomeRow], [expenseRow], [], '2024-06-15')
    expect(csv).toContain('200.00')
    expect(csv).toContain('50.00')
    expect(csv).toContain('150.00')  // net
  })

  it('handles empty inputs gracefully', () => {
    const csv = accountantSummaryToCSV([], [], [], '2024-01-01')
    expect(csv).toContain('0.00')
    expect(csv).toContain('INCOME ENTRIES')
  })

  it('includes the report date', () => {
    const csv = accountantSummaryToCSV([], [], [], '2024-07-04')
    expect(csv).toContain('2024-07-04')
  })
})
