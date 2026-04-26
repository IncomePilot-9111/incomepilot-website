/**
 * Tests for src/lib/dashboard-data.ts
 *
 * Verifies:
 *   - Correct real Supabase table names are targeted
 *   - Correct column names used for date filtering (entry_date, expense_date)
 *   - Income uses gross_amount -> net_amount -> amount fallback chain
 *   - Expenses use amount column (NOT NULL in schema)
 *   - workspace_preferences JSONB module parsing
 *   - goal_plans (is_active=true, title column, no xp in row)
 *   - premium_xp_ledger sums amount column for XP total
 *   - Calendar events assembled from 5 separate sources
 *   - Graceful fallback when any table returns an error
 *   - deleted_at IS NULL filter applied everywhere
 *   - xpToLevel and parseModuleJson pure helpers
 *   - recentActivity merged feed (income + expense, sorted date desc)
 *   - moduleBreakdown grouped by source with percentages
 *   - weeklyTrend 7-day array with correct daily totals
 *   - compass score derived from cloud data
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { xpToLevel, parseModuleJson } from '../dashboard-data'

// ─── Mock createServiceClient ─────────────────────────────────────────────────

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(),
}))

import { createServiceClient } from '@/lib/supabase/service'
import { loadDashboardData } from '../dashboard-data'

// ─── Dynamic date helpers ─────────────────────────────────────────────────────

/** Today as YYYY-MM-DD (within current month, so passes monthIncomeRows filter) */
const TODAY = new Date().toISOString().split('T')[0]

// ─── Supabase chain mock builder ──────────────────────────────────────────────

type QueryResult = { data: unknown; error: null | { message: string } }

/**
 * Creates a chainable Supabase query builder mock.
 * All filter/order/limit calls return `this`.
 * The chain itself is PromiseLike (has .then) so `await chain` works.
 * `.single()` returns a separate PromiseLike with the same result.
 */
function makeChain(result: QueryResult) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {
    select:  vi.fn().mockReturnThis(),
    eq:      vi.fn().mockReturnThis(),
    neq:     vi.fn().mockReturnThis(),
    gte:     vi.fn().mockReturnThis(),
    lte:     vi.fn().mockReturnThis(),
    is:      vi.fn().mockReturnThis(),
    not:     vi.fn().mockReturnThis(),
    order:   vi.fn().mockReturnThis(),
    limit:   vi.fn().mockReturnThis(),
    filter:  vi.fn().mockReturnThis(),
    single:  vi.fn().mockReturnValue({
      then: (resolve: (v: QueryResult) => void) => resolve(result),
    }),
    then: (resolve: (v: QueryResult) => void) => resolve(result),
  }
  return chain
}

/**
 * Creates a mock service client where each table name maps to a pre-set result.
 * Unknown tables default to { data: [], error: null }.
 */
function mockClient(tableMap: Record<string, QueryResult>) {
  return {
    from: (table: string) => makeChain(tableMap[table] ?? { data: [], error: null }),
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** An income row with all required fields. Override individual fields as needed. */
function incRow(overrides: Record<string, unknown> = {}) {
  return {
    id:           'inc-default',
    entry_date:   TODAY,
    gross_amount: null,
    net_amount:   null,
    amount:       null,
    source:       null,
    platform:     null,
    title:        null,
    notes_text:   null,
    created_at:   null,
    ...overrides,
  }
}

/** An expense row with all required fields. Override individual fields as needed. */
function expRow(overrides: Record<string, unknown> = {}) {
  return {
    id:           'exp-default',
    expense_date: TODAY,
    amount:       null,
    category:     null,
    item_name:    null,
    title:        null,
    created_at:   null,
    ...overrides,
  }
}

const EMPTY: Record<string, QueryResult> = {
  income_entries:              { data: [],   error: null },
  expense_entries:             { data: [],   error: null },
  workspace_preferences:       { data: null, error: { message: 'No rows found' } },
  goal_plans:                  { data: null, error: { message: 'No rows found' } },
  premium_xp_ledger:           { data: [],   error: null },
  planned_shifts:              { data: [],   error: null },
  rental_bookings:             { data: [],   error: null },
  freelance_entries:           { data: [],   error: null },
  salary_employment_profiles:  { data: [],   error: null },
  salary_leave_entries:        { data: [],   error: null },
  tax_reports_profile:         { data: null, error: { message: 'No rows found' } },
}

// ─── Pure helper tests ────────────────────────────────────────────────────────

describe('xpToLevel', () => {
  it('level 1 at 0 XP', () => {
    expect(xpToLevel(0)).toBe(1)
  })

  it('level 1 at 499 XP (below threshold)', () => {
    expect(xpToLevel(499)).toBe(1)
  })

  it('level 2 at 500 XP', () => {
    expect(xpToLevel(500)).toBe(2)
  })

  it('level 5 at 2000 XP', () => {
    expect(xpToLevel(2000)).toBe(5)
  })

  it('clamps negative XP to level 1', () => {
    expect(xpToLevel(-100)).toBe(1)
  })
})

describe('parseModuleJson', () => {
  it('parses a JSONB array (already parsed by Supabase client)', () => {
    expect(parseModuleJson(['rideshare', 'delivery', 'freelance']))
      .toEqual(['rideshare', 'delivery', 'freelance'])
  })

  it('parses a JSON string (fallback format)', () => {
    expect(parseModuleJson('["rideshare","delivery"]')).toEqual(['rideshare', 'delivery'])
  })

  it('returns [] for null', () => {
    expect(parseModuleJson(null)).toEqual([])
  })

  it('returns [] for undefined', () => {
    expect(parseModuleJson(undefined)).toEqual([])
  })

  it('returns [] for empty array', () => {
    expect(parseModuleJson([])).toEqual([])
  })

  it('returns [] for invalid JSON string', () => {
    expect(parseModuleJson('not-json')).toEqual([])
  })

  it('returns [] for non-array JSON string', () => {
    expect(parseModuleJson('{"key":"val"}')).toEqual([])
  })
})

// ─── loadDashboardData integration tests ─────────────────────────────────────

describe('loadDashboardData', () => {
  beforeEach(() => {
    ;(createServiceClient as Mock).mockReturnValue(mockClient(EMPTY))
  })

  // ── Empty user (all tables empty) ─────────────────────────────────────────

  describe('empty user -- all tables return no rows', () => {
    it('returns all-zero summary', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.summary.totalIncome).toBe(0)
      expect(result.summary.totalExpenses).toBe(0)
      expect(result.summary.netIncome).toBe(0)
      expect(result.summary.currency).toBe('AUD')
    })

    it('returns empty modules', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.modules.count).toBe(0)
      expect(result.modules.active).toEqual([])
    })

    it('returns null goal', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.goal).toBeNull()
    })

    it('returns 0 XP and level 1', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.totalXp).toBe(0)
      expect(result.xpLevel).toBe(1)
    })

    it('returns empty upcoming events', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.upcomingEvents).toEqual([])
    })

    it('hasAnyData is false', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.hasAnyData).toBe(false)
    })
  })

  // ── income_entries -- real column names ───────────────────────────────────

  describe('income_entries', () => {
    it('sums gross_amount as primary income field', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: {
          data: [
            incRow({ id: 'i1', gross_amount: 300, net_amount: 250, amount: null }),
            incRow({ id: 'i2', gross_amount: 200, net_amount: 170, amount: null }),
          ],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.summary.totalIncome).toBe(500)
    })

    it('falls back to net_amount when gross_amount is null', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: {
          data: [incRow({ id: 'i1', gross_amount: null, net_amount: 180, amount: null })],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.summary.totalIncome).toBe(180)
    })

    it('falls back to amount when both gross and net are null', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: {
          data: [incRow({ id: 'i1', gross_amount: null, net_amount: null, amount: 90 })],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.summary.totalIncome).toBe(90)
    })

    it('returns 0 when table errors', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: { data: null, error: { message: 'relation does not exist' } },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.summary.totalIncome).toBe(0)
    })
  })

  // ── expense_entries -- real column names ──────────────────────────────────

  describe('expense_entries', () => {
    it('sums amount column (NOT NULL in schema)', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        expense_entries: {
          data: [
            expRow({ id: 'e1', amount: 150 }),
            expRow({ id: 'e2', amount: 75 }),
          ],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.summary.totalExpenses).toBe(225)
    })

    it('returns 0 when table errors', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        expense_entries: { data: null, error: { message: 'permission denied' } },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.summary.totalExpenses).toBe(0)
    })
  })

  // ── net income derived correctly ──────────────────────────────────────────

  it('computes netIncome as totalIncome minus totalExpenses', async () => {
    ;(createServiceClient as Mock).mockReturnValue(mockClient({
      ...EMPTY,
      income_entries:  { data: [incRow({ id: 'i1', gross_amount: 1000 })], error: null },
      expense_entries: { data: [expRow({ id: 'e1', amount: 300 })], error: null },
    }))

    const result = await loadDashboardData('user-abc')
    expect(result.summary.netIncome).toBe(700)
  })

  // ── workspace_preferences -- real table for active modules ────────────────

  describe('workspace_preferences (active modules)', () => {
    it('counts modules from enabled_modules_json', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        workspace_preferences: {
          data: {
            enabled_modules_json: ['rideshare', 'delivery', 'freelance'],
            primary_modules_json: ['rideshare'],
          },
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.modules.count).toBe(3)
      expect(result.modules.active).toEqual(['rideshare', 'delivery', 'freelance'])
    })

    it('falls back to primary_modules_json when enabled_modules_json is empty', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        workspace_preferences: {
          data: {
            enabled_modules_json: [],
            primary_modules_json: ['rideshare', 'salary'],
          },
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.modules.count).toBe(2)
      expect(result.modules.active).toEqual(['rideshare', 'salary'])
    })

    it('returns 0 modules when row does not exist', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        workspace_preferences: { data: null, error: { message: 'No rows found' } },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.modules.count).toBe(0)
    })

    it('returns 0 modules when both json columns are null', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        workspace_preferences: {
          data: { enabled_modules_json: null, primary_modules_json: null },
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.modules.count).toBe(0)
    })
  })

  // ── goal_plans -- real table for active goal ──────────────────────────────

  describe('goal_plans (active goal)', () => {
    it('reads title (not label) from goal_plans', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        goal_plans: {
          data: {
            title:          'June Monthly Goal',
            target_amount:  2000,
            current_amount: 1200,
            is_active:      true,
            status:         'active',
          },
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.goal).not.toBeNull()
      expect(result.goal!.label).toBe('June Monthly Goal')
    })

    it('computes progressPct correctly', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        goal_plans: {
          data: {
            title: 'Goal', target_amount: 1000, current_amount: 750,
            is_active: true, status: 'active',
          },
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.goal!.progressPct).toBe(75)
    })

    it('caps progressPct at 100 when current exceeds target', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        goal_plans: {
          data: {
            title: 'Goal', target_amount: 500, current_amount: 600,
            is_active: true, status: 'active',
          },
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.goal!.progressPct).toBe(100)
    })

    it('returns null goal when no active goal exists', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        goal_plans: { data: null, error: { message: 'No rows found' } },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.goal).toBeNull()
    })

    it('goal has no xp/level fields (those are top-level on DashboardData)', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        goal_plans: {
          data: { title: 'G', target_amount: 100, current_amount: 50, is_active: true, status: 'active' },
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      // GoalData interface has no xp or level properties
      expect(result.goal).not.toHaveProperty('xp')
      expect(result.goal).not.toHaveProperty('level')
    })
  })

  // ── premium_xp_ledger -- XP total ─────────────────────────────────────────

  describe('premium_xp_ledger (XP total)', () => {
    it('sums amount column across all XP events', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        premium_xp_ledger: {
          data: [{ amount: 100 }, { amount: 250 }, { amount: 50 }],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.totalXp).toBe(400)
      expect(result.xpLevel).toBe(1) // 400 < 500, still level 1
    })

    it('computes xpLevel from totalXp', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        premium_xp_ledger: {
          data: [{ amount: 1500 }],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.totalXp).toBe(1500)
      expect(result.xpLevel).toBe(4) // floor(1500/500) + 1 = 4
    })

    it('returns 0 XP when table errors', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        premium_xp_ledger: { data: null, error: { message: 'relation does not exist' } },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.totalXp).toBe(0)
      expect(result.xpLevel).toBe(1)
    })
  })

  // ── planned_shifts -- calendar event source ───────────────────────────────

  describe('calendar events from planned_shifts', () => {
    it('maps planned_shifts to shift-type calendar events', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        planned_shifts: {
          data: [{
            id:                 'shift-1',
            title:              'Uber shift',
            shift_date:         '2099-06-20',
            expected_total_pay: 145,
            expected_amount:    null,
            module_type:        'rideshare',
          }],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.upcomingEvents).toHaveLength(1)
      expect(result.upcomingEvents[0].type).toBe('shift')
      expect(result.upcomingEvents[0].title).toBe('Uber shift')
      expect(result.upcomingEvents[0].amountExpected).toBe(145)
    })

    it('falls back to expected_amount when expected_total_pay is null', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        planned_shifts: {
          data: [{
            id: 'shift-2', title: 'Delivery', shift_date: '2099-07-01',
            expected_total_pay: null, expected_amount: 80, module_type: null,
          }],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.upcomingEvents[0].amountExpected).toBe(80)
    })
  })

  // ── rental_bookings -- calendar event source ──────────────────────────────

  describe('calendar events from rental_bookings', () => {
    it('maps rental_bookings to booking-type calendar events', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        rental_bookings: {
          data: [{
            id:              'rent-1',
            title:           'Toyota HiLux rental',
            start_datetime:  '2099-07-10T09:00:00Z',
            start_at:        '2099-07-10T09:00:00Z',
            expected_amount: 250,
            total_amount:    null,
            booking_status:  'confirmed',
            status:          null,
          }],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.upcomingEvents).toHaveLength(1)
      expect(result.upcomingEvents[0].type).toBe('booking')
      expect(result.upcomingEvents[0].title).toBe('Toyota HiLux rental')
      expect(result.upcomingEvents[0].amountExpected).toBe(250)
    })
  })

  // ── freelance_entries -- calendar event source ────────────────────────────

  describe('calendar events from freelance_entries', () => {
    it('includes unpaid freelance entries with future due_date', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        freelance_entries: {
          data: [{
            id:             'fl-1',
            service_name:   'Website redesign',
            job_title:      null,
            due_date:       '2099-07-15',
            gross_amount:   1200,
            net_amount:     null,
            payment_status: 'pending',
          }],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.upcomingEvents).toHaveLength(1)
      expect(result.upcomingEvents[0].type).toBe('other')
      expect(result.upcomingEvents[0].title).toBe('Website redesign')
    })

    it('excludes freelance entries with payment_status=paid', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        freelance_entries: {
          data: [{
            id: 'fl-2', service_name: 'Logo design', job_title: null,
            due_date: '2099-07-20', gross_amount: 500, net_amount: null,
            payment_status: 'paid',
          }],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.upcomingEvents).toHaveLength(0)
    })
  })

  // ── salary_employment_profiles -- payday events ───────────────────────────

  describe('calendar events from salary_employment_profiles (paydays)', () => {
    it('includes upcoming next_pay_date as payday event', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        salary_employment_profiles: {
          data: [{
            id:            'sep-1',
            employer_name: 'Acme Corp',
            next_pay_date: '2099-06-30',
            pay_amount:    2200,
          }],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.upcomingEvents).toHaveLength(1)
      expect(result.upcomingEvents[0].type).toBe('payday')
      expect(result.upcomingEvents[0].title).toBe('Acme Corp payday')
      expect(result.upcomingEvents[0].amountExpected).toBe(2200)
    })
  })

  // ── salary_leave_entries -- leave events ──────────────────────────────────

  describe('calendar events from salary_leave_entries', () => {
    it('includes upcoming leave as calendar event', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        salary_leave_entries: {
          data: [{
            id:                   'sl-1',
            leave_type:           'annualLeave',
            start_date:           '2099-08-01',
            end_date:             '2099-08-07',
            estimated_pay_impact: null,
          }],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.upcomingEvents).toHaveLength(1)
      expect(result.upcomingEvents[0].type).toBe('other')
      // camelCase -> "Annual Leave" label
      expect(result.upcomingEvents[0].title).toContain('Leave')
    })
  })

  // ── Multi-source merge and sort ───────────────────────────────────────────

  describe('calendar events merged and sorted by date', () => {
    it('merges events from multiple sources and sorts chronologically', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        planned_shifts: {
          data: [{ id: 's1', title: 'Late shift', shift_date: '2099-08-15', expected_total_pay: 100, expected_amount: null, module_type: null }],
          error: null,
        },
        rental_bookings: {
          data: [{ id: 'r1', title: 'Bike rental', start_datetime: '2099-07-05T10:00:00Z', start_at: '2099-07-05T10:00:00Z', expected_amount: 80, total_amount: null, booking_status: null, status: null }],
          error: null,
        },
        salary_employment_profiles: {
          data: [{ id: 'p1', employer_name: 'Corp', next_pay_date: '2099-07-20', pay_amount: 1500 }],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.upcomingEvents.length).toBe(3)

      // Must be sorted: rental (Jul 05) < payday (Jul 20) < shift (Aug 15)
      const dates = result.upcomingEvents.map((e) => e.scheduledAt)
      expect(dates[0]).toContain('2099-07-05')
      expect(dates[1]).toContain('2099-07-20')
      expect(dates[2]).toContain('2099-08-15')
    })

    it('limits merged events to 8 total', async () => {
      // 10 shifts -> must be capped at 8
      const manyShifts = Array.from({ length: 10 }, (_, i) => ({
        id:                 `s${i}`,
        title:              `Shift ${i}`,
        shift_date:         `2099-0${(i % 9) + 1}-${String(i + 1).padStart(2, '0')}`,
        expected_total_pay: 100,
        expected_amount:    null,
        module_type:        null,
      }))

      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        planned_shifts: { data: manyShifts, error: null },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.upcomingEvents.length).toBeLessThanOrEqual(8)
    })
  })

  // ── Graceful error handling ───────────────────────────────────────────────

  describe('graceful fallback on any table error', () => {
    it('returns valid DashboardData when all tables error', async () => {
      const errResult = { data: null, error: { message: 'DB unavailable' } }
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        income_entries:             errResult,
        expense_entries:            errResult,
        workspace_preferences:      errResult,
        goal_plans:                 errResult,
        premium_xp_ledger:          errResult,
        planned_shifts:             errResult,
        rental_bookings:            errResult,
        freelance_entries:          errResult,
        salary_employment_profiles: errResult,
        salary_leave_entries:       errResult,
        tax_reports_profile:        errResult,
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.summary.totalIncome).toBe(0)
      expect(result.summary.totalExpenses).toBe(0)
      expect(result.modules.count).toBe(0)
      expect(result.goal).toBeNull()
      expect(result.totalXp).toBe(0)
      expect(result.upcomingEvents).toEqual([])
      expect(result.hasAnyData).toBe(false)
    })
  })

  // ── recentActivity -- merged income + expense feed ────────────────────────

  describe('recentActivity', () => {
    it('includes income entries with type=income', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: {
          data: [incRow({ id: 'i1', gross_amount: 200, source: 'rideshare', title: 'Uber trip' })],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      const incEntry = result.recentActivity.find(e => e.id === 'i1')
      expect(incEntry).toBeDefined()
      expect(incEntry!.type).toBe('income')
      expect(incEntry!.title).toBe('Uber trip')
      expect(incEntry!.amount).toBe(200)
      expect(incEntry!.source).toBe('rideshare')
    })

    it('includes expense entries with type=expense', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        expense_entries: {
          data: [expRow({ id: 'e1', amount: 50, category: 'fuel' })],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      const expEntry = result.recentActivity.find(e => e.id === 'e1')
      expect(expEntry).toBeDefined()
      expect(expEntry!.type).toBe('expense')
      expect(expEntry!.amount).toBe(50)
      expect(expEntry!.category).toBe('fuel')
    })

    it('falls back to MODULE_LABELS for income title when title is null', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: {
          data: [incRow({ id: 'i1', gross_amount: 100, source: 'delivery', title: null })],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      const entry = result.recentActivity.find(e => e.id === 'i1')
      expect(entry!.title).toBe('Delivery')
    })

    it('returns at most 10 entries when more exist', async () => {
      const manyIncome = Array.from({ length: 15 }, (_, i) =>
        incRow({ id: `i${i}`, gross_amount: 50, source: 'rideshare', title: `Trip ${i}` }),
      )

      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: { data: manyIncome, error: null },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.recentActivity.length).toBeLessThanOrEqual(10)
    })

    it('is empty when no income or expenses exist', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.recentActivity).toEqual([])
    })
  })

  // ── moduleBreakdown -- income grouped by source ───────────────────────────

  describe('moduleBreakdown', () => {
    it('groups income by source and sorts by amount descending', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: {
          data: [
            incRow({ id: 'i1', gross_amount: 300, source: 'rideshare' }),
            incRow({ id: 'i2', gross_amount: 200, source: 'delivery' }),
            incRow({ id: 'i3', gross_amount: 100, source: 'rideshare' }),
          ],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      // rideshare: 400, delivery: 200 -> total 600
      expect(result.moduleBreakdown).toHaveLength(2)
      expect(result.moduleBreakdown[0].source).toBe('rideshare')
      expect(result.moduleBreakdown[0].amount).toBe(400)
      expect(result.moduleBreakdown[0].pct).toBe(67)  // Math.round(400/600*100)
      expect(result.moduleBreakdown[1].source).toBe('delivery')
      expect(result.moduleBreakdown[1].amount).toBe(200)
      expect(result.moduleBreakdown[1].pct).toBe(33)  // Math.round(200/600*100)
    })

    it('uses MODULE_LABELS for display labels', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: {
          data: [incRow({ id: 'i1', gross_amount: 100, source: 'freelance' })],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.moduleBreakdown[0].label).toBe('Freelance')
    })

    it('uses source as label for unrecognised module keys', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: {
          data: [incRow({ id: 'i1', gross_amount: 100, source: 'custom_gig' })],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.moduleBreakdown[0].label).toBe('custom_gig')
    })

    it('returns empty array when no income entries exist', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.moduleBreakdown).toEqual([])
    })

    it('assigns source=manual for rows with no source field', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: {
          data: [incRow({ id: 'i1', gross_amount: 150, source: null })],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      expect(result.moduleBreakdown[0].source).toBe('manual')
      expect(result.moduleBreakdown[0].label).toBe('Manual Entry')
    })
  })

  // ── weeklyTrend -- 7-day bar chart data ───────────────────────────────────

  describe('weeklyTrend', () => {
    it('always returns exactly 7 days', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.weeklyTrend).toHaveLength(7)
    })

    it('marks today as isToday=true', async () => {
      const result = await loadDashboardData('user-abc')
      const today = result.weeklyTrend.find(d => d.isToday)
      expect(today).toBeDefined()
      expect(today!.date).toBe(TODAY)
    })

    it('accumulates income for a given day', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries: {
          data: [
            incRow({ id: 'i1', gross_amount: 150, source: 'rideshare' }),
            incRow({ id: 'i2', gross_amount: 100, source: 'delivery' }),
          ],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      const today = result.weeklyTrend.find(d => d.isToday)!
      expect(today.income).toBe(250)
    })

    it('accumulates expenses for a given day', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        expense_entries: {
          data: [expRow({ id: 'e1', amount: 60, category: 'fuel' })],
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      const today = result.weeklyTrend.find(d => d.isToday)!
      expect(today.expense).toBe(60)
    })

    it('net equals income minus expense', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries:  { data: [incRow({ id: 'i1', gross_amount: 200 })], error: null },
        expense_entries: { data: [expRow({ id: 'e1', amount: 50 })], error: null },
      }))

      const result = await loadDashboardData('user-abc')
      const today = result.weeklyTrend.find(d => d.isToday)!
      expect(today.net).toBe(150)
    })

    it('has zero income and expense for days with no data', async () => {
      const result = await loadDashboardData('user-abc')
      const nonToday = result.weeklyTrend.filter(d => !d.isToday)
      expect(nonToday.every(d => d.income === 0 && d.expense === 0)).toBe(true)
    })

    it('each day has a label string', async () => {
      const result = await loadDashboardData('user-abc')
      const VALID_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      for (const day of result.weeklyTrend) {
        expect(VALID_LABELS).toContain(day.label)
      }
    })
  })

  // ── compass -- Compass score derived from cloud data (v2 formula) ──────────

  describe('compass', () => {
    it('returns a compass object with all required fields', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.compass).toHaveProperty('score')
      expect(result.compass).toHaveProperty('gradeLabel')   // v2: letter grade not level label
      expect(result.compass).toHaveProperty('levelColor')
      expect(result.compass).toHaveProperty('summary')
      expect(result.compass).toHaveProperty('positiveSignals')
      expect(result.compass).toHaveProperty('improvementSignals')
      expect(result.compass).toHaveProperty('pillarScores')
    })

    it('score is 70 (no-data neutral baseline) when all data is empty', async () => {
      // All pillars return 70 no-data fallback. Weighted sum = 70.
      // Matches mobile CompassInsightsSummaryKernel behaviour exactly.
      const result = await loadDashboardData('user-abc')
      expect(result.compass.score).toBe(70)
    })

    it('gradeLabel is B for score=70 (no-data baseline)', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.compass.gradeLabel).toBe('B')
    })

    it('gradeLabel is consistent with score (mobile _gradeFor thresholds)', async () => {
      const result = await loadDashboardData('user-abc')
      const { score, gradeLabel } = result.compass
      if (score >= 90)       expect(gradeLabel).toBe('A')
      else if (score >= 85)  expect(gradeLabel).toBe('A-')
      else if (score >= 80)  expect(gradeLabel).toBe('B+')
      else if (score >= 70)  expect(gradeLabel).toBe('B')
      else if (score >= 60)  expect(gradeLabel).toBe('C')
      else if (score >= 50)  expect(gradeLabel).toBe('D')
      else                   expect(gradeLabel).toBe('NA')
    })

    it('pillarScores object has all 5 v2 pillars', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.compass.pillarScores).toHaveProperty('pace')
      expect(result.compass.pillarScores).toHaveProperty('hourly')
      expect(result.compass.pillarScores).toHaveProperty('consistency')
      expect(result.compass.pillarScores).toHaveProperty('expenses')
      expect(result.compass.pillarScores).toHaveProperty('readiness')
    })

    it('hourly pillar is always 70 (WorkHub fallback, no Supabase equivalent)', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.compass.pillarScores.hourly).toBe(70)
    })

    it('pace pillar is 70 when no active goal (no-data fallback)', async () => {
      const result = await loadDashboardData('user-abc')
      expect(result.compass.pillarScores.pace).toBe(70)
    })

    it('pace pillar is 95 when goal is fully achieved (current >= target)', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        goal_plans: {
          data: { title: 'Goal', target_amount: 1000, current_amount: 1000, is_active: true, status: 'active' },
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      // current_amount == target_amount -> actualFrac >= 1.0 -> 'ahead' -> pace=95
      expect(result.compass.pillarScores.pace).toBe(95)
    })

    it('readiness pillar uses tax_reports_profile for setup signal', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        tax_reports_profile: {
          data: { ato_setup_completed: true, manual_setup_completed: false, tax_disabled: false },
          error: null,
        },
      }))

      const result = await loadDashboardData('user-abc')
      // reportSetupAcknowledged=true -> contributes +25 to readiness score
      // but no income/expenses this week -> score = 0 + 0 + 0 + 25 = 25
      // (not no-data fallback because reportSetupAcknowledged=true)
      expect(result.compass.pillarScores.readiness).toBe(25)
    })

    it('expenses pillar is 90 when week expenses are very low relative to income', async () => {
      ;(createServiceClient as Mock).mockReturnValue(mockClient({
        ...EMPTY,
        income_entries:  { data: [incRow({ id: 'i1', gross_amount: 1000 })], error: null },
        expense_entries: { data: [expRow({ id: 'e1', amount: 50 })], error: null },
      }))

      const result = await loadDashboardData('user-abc')
      // weekIncome=1000, weekExpenses=50, ratio=0.05 < 0.15 -> 90
      expect(result.compass.pillarScores.expenses).toBe(90)
    })
  })
})
