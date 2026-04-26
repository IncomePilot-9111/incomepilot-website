/**
 * Dashboard data loader -- SERVER ONLY.
 *
 * Single orchestrated entry point: loadDashboardData().
 * Fetches two broad row-level datasets (income + expenses for the last
 * 14-day window) and derives all metrics in memory. All remaining
 * queries run concurrently via Promise.all.
 *
 * Real PolarisPilot Supabase table names (verified from v1_schema.sql):
 *   income_entries       -- entry_date (date), gross_amount, net_amount, amount
 *   expense_entries      -- expense_date (date), amount (NOT NULL)
 *   workspace_preferences-- enabled_modules_json / primary_modules_json (jsonb)
 *   goal_plans           -- title, target_amount, current_amount, is_active
 *   premium_xp_ledger    -- amount (integer, XP per event)
 *   planned_shifts       -- shift_date (date), expected_total_pay
 *   rental_bookings      -- start_datetime (NOT NULL), expected_amount
 *   freelance_entries    -- due_date (date), gross_amount
 *   salary_employment_profiles -- next_pay_date (text), pay_amount
 *   salary_leave_entries -- start_date (date), leave_type
 *
 * All queries add .is('deleted_at', null) to exclude soft-deleted rows.
 * Every query is wrapped in safeQuery() -- the dashboard never crashes on
 * missing tables, RLS errors, or empty data.
 */
import { createServiceClient } from '@/lib/supabase/service'
import { computeCompassScore } from '@/lib/compass-score'
import type { CompassData }    from '@/lib/compass-score'

// ─── Re-export CompassData so callers don't need a second import ──────────────
export type { CompassData }

// ─── Public types ─────────────────────────────────────────────────────────────

export interface SummaryData {
  totalIncome:   number
  totalExpenses: number
  netIncome:     number
  currency:      string
  periodLabel:   string
}

export interface ModuleData {
  active: string[]
  count:  number
}

export interface GoalData {
  label:         string
  currentAmount: number
  targetAmount:  number
  progressPct:   number
}

export interface CalendarEvent {
  id:             string
  title:          string
  scheduledAt:    string          // ISO string -- sort key
  type:           'shift' | 'payday' | 'booking' | 'other'
  amountExpected: number | null
}

export interface ActivityEntry {
  id:       string
  date:     string               // YYYY-MM-DD
  type:     'income' | 'expense'
  title:    string
  amount:   number
  source:   string | null        // income: source field
  category: string | null        // expense: category field
}

export interface ModuleIncome {
  source: string
  label:  string
  amount: number
  pct:    number                 // % of total income this month
}

export interface TrendDay {
  date:    string                // YYYY-MM-DD
  label:   string                // "Mon", "Tue", etc.
  income:  number
  expense: number
  net:     number
  isToday: boolean
}

export interface DashboardData {
  summary:         SummaryData
  modules:         ModuleData
  goal:            GoalData | null
  totalXp:         number
  xpLevel:         number
  upcomingEvents:  CalendarEvent[]
  recentActivity:  ActivityEntry[]
  moduleBreakdown: ModuleIncome[]
  weeklyTrend:     TrendDay[]
  compass:         CompassData
  hasAnyData:      boolean
}

// ─── Private row types ────────────────────────────────────────────────────────

interface IncomeRow {
  id:           string
  entry_date:   string
  gross_amount: number | null
  net_amount:   number | null
  amount:       number | null
  source:       string | null
  platform:     string | null
  title:        string | null
  notes_text:   string | null
  created_at:   string | null
}

interface ExpenseRow {
  id:           string
  expense_date: string
  amount:       number | null
  category:     string | null
  item_name:    string | null
  title:        string | null
  created_at:   string | null
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

function formatPeriodLabel(): string {
  return new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function monthStartDateStr(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function monthEndDateStr(now: Date): string {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

/** ISO week: return the Monday of the week containing `now` as YYYY-MM-DD */
function currentWeekStartStr(now: Date): string {
  const d   = new Date(now)
  const day = d.getDay()  // 0=Sun 1=Mon ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day  // days to Monday
  d.setDate(d.getDate() + diff)
  return toDateStr(d)
}

/** Derive goal pace relative to today's expected progress through the month.
 *  Matches the spirit of _buildPacePillar's 'ahead'/'onPace'/'behind' logic. */
function deriveGoalPaceStatus(
  goal: GoalData | null,
  now: Date,
): 'ahead' | 'onPace' | 'behind' | null {
  if (!goal || goal.targetAmount <= 0) return null
  const daysInMonth     = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth      = now.getDate()
  const expectedFrac    = dayOfMonth / daysInMonth
  const actualFrac      = goal.currentAmount / goal.targetAmount
  if (actualFrac >= 1.0 || actualFrac >= expectedFrac * 1.05) return 'ahead'
  if (actualFrac >= expectedFrac * 0.85)                       return 'onPace'
  return 'behind'
}

/** Return the lexicographically earlier YYYY-MM-DD string */
function earlierDate(a: string, b: string): string {
  return a <= b ? a : b
}

export function xpToLevel(xp: number): number {
  return Math.floor(Math.max(0, xp) / 500) + 1
}

export function parseModuleJson(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
    } catch {
      return []
    }
  }
  return []
}

function rowIncomeAmount(r: IncomeRow): number {
  return r.gross_amount ?? r.net_amount ?? r.amount ?? 0
}

// ─── Module labels ────────────────────────────────────────────────────────────

export const MODULE_LABELS: Record<string, string> = {
  shift_worker: 'Shift Work',
  rideshare:    'Rideshare',
  delivery:     'Delivery',
  freelance:    'Freelance',
  rentals:      'Rentals',
  salary:       'Salary',
  manual:       'Manual Entry',
}

export const MODULE_COLORS: Record<string, string> = {
  shift_worker: '#3DD6B0',
  rideshare:    '#5EE4C0',
  delivery:     '#60C8F5',
  freelance:    '#A78BFA',
  rentals:      '#F59E6A',
  salary:       '#34D399',
  manual:       '#8CB4C0',
}

// ─── In-memory derivations ────────────────────────────────────────────────────

function deriveWeeklyTrend(
  incomeRows:  IncomeRow[],
  expenseRows: ExpenseRow[],
  now:         Date,
): TrendDay[] {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const todayStr = toDateStr(now)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const dateStr  = toDateStr(d)
    const dayLabel = DAY_LABELS[d.getDay()]

    const income  = incomeRows
      .filter(r => r.entry_date === dateStr)
      .reduce((s, r) => s + rowIncomeAmount(r), 0)

    const expense = expenseRows
      .filter(r => r.expense_date === dateStr)
      .reduce((s, r) => s + (r.amount ?? 0), 0)

    return {
      date:    dateStr,
      label:   dayLabel,
      income,
      expense,
      net:     income - expense,
      isToday: dateStr === todayStr,
    }
  })
}

function deriveModuleBreakdown(
  monthRows:   IncomeRow[],
  totalIncome: number,
): ModuleIncome[] {
  const bySource: Record<string, number> = {}

  for (const row of monthRows) {
    const src    = row.source ?? 'manual'
    const amount = rowIncomeAmount(row)
    bySource[src] = (bySource[src] ?? 0) + amount
  }

  return Object.entries(bySource)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([source, amount]) => ({
      source,
      label:  MODULE_LABELS[source] ?? source,
      amount,
      pct: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
    }))
}

function deriveRecentActivity(
  incomeRows:  IncomeRow[],
  expenseRows: ExpenseRow[],
): ActivityEntry[] {
  const inc: ActivityEntry[] = incomeRows.slice(0, 8).map(r => ({
    id:       r.id,
    date:     r.entry_date,
    type:     'income' as const,
    title:    r.title ?? MODULE_LABELS[r.source ?? ''] ?? r.source ?? 'Income',
    amount:   rowIncomeAmount(r),
    source:   r.source ?? null,
    category: null,
  }))

  const exp: ActivityEntry[] = expenseRows.slice(0, 5).map(r => ({
    id:       r.id,
    date:     r.expense_date,
    type:     'expense' as const,
    title:    r.title ?? r.item_name ?? r.category ?? 'Expense',
    amount:   r.amount ?? 0,
    source:   null,
    category: r.category ?? null,
  }))

  return [...inc, ...exp]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
}

// ─── Database loaders ─────────────────────────────────────────────────────────

type ServiceClient = ReturnType<typeof createServiceClient>

async function loadIncomeRows(
  service:   ServiceClient,
  userId:    string,
  startDate: string,
  endDate:   string,
): Promise<IncomeRow[]> {
  return safeQuery(async () => {
    const { data, error } = await service
      .from('income_entries')
      .select('id, entry_date, gross_amount, net_amount, amount, source, platform, title, notes_text, created_at')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .is('deleted_at', null)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) return []
    return (data ?? []) as IncomeRow[]
  }, [])
}

async function loadExpenseRows(
  service:   ServiceClient,
  userId:    string,
  startDate: string,
  endDate:   string,
): Promise<ExpenseRow[]> {
  return safeQuery(async () => {
    const { data, error } = await service
      .from('expense_entries')
      .select('id, expense_date, amount, category, item_name, title, created_at')
      .eq('user_id', userId)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .is('deleted_at', null)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) return []
    return (data ?? []) as ExpenseRow[]
  }, [])
}

async function loadModules(
  service: ServiceClient,
  userId:  string,
): Promise<ModuleData> {
  return safeQuery(async () => {
    const { data, error } = await service
      .from('workspace_preferences')
      .select('enabled_modules_json, primary_modules_json')
      .eq('user_id', userId)
      .single()

    if (error || !data) return { active: [] as string[], count: 0 }

    const row = data as { enabled_modules_json: unknown; primary_modules_json: unknown }
    const active =
      parseModuleJson(row.enabled_modules_json).length > 0
        ? parseModuleJson(row.enabled_modules_json)
        : parseModuleJson(row.primary_modules_json)

    return { active, count: active.length }
  }, { active: [] as string[], count: 0 })
}

async function loadActiveGoal(
  service: ServiceClient,
  userId:  string,
): Promise<GoalData | null> {
  return safeQuery<GoalData | null>(async () => {
    const { data, error } = await service
      .from('goal_plans')
      .select('title, target_amount, current_amount, is_active, status')
      .eq('user_id', userId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    const row = data as {
      title:          string | null
      target_amount:  number | null
      current_amount: number | null
    }

    const current = row.current_amount ?? 0
    const target  = row.target_amount  ?? 0

    return {
      label:         row.title ?? 'Income Goal',
      currentAmount: current,
      targetAmount:  target,
      progressPct:   target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
    }
  }, null)
}

async function loadTotalXp(
  service: ServiceClient,
  userId:  string,
): Promise<number> {
  return safeQuery(async () => {
    const { data, error } = await service
      .from('premium_xp_ledger')
      .select('amount')
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) return 0
    return (data ?? []).reduce((s: number, r: { amount: number | null }) => s + (r.amount ?? 0), 0)
  }, 0)
}

interface TaxReportsRow {
  ato_setup_completed:    boolean | null
  manual_setup_completed: boolean | null
  tax_disabled:           boolean | null
}

async function loadTaxReportsProfile(
  service: ServiceClient,
  userId:  string,
): Promise<TaxReportsRow | null> {
  return safeQuery<TaxReportsRow | null>(async () => {
    const { data, error } = await service
      .from('tax_reports_profile')
      .select('ato_setup_completed, manual_setup_completed, tax_disabled')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (error || !data) return null
    return data as TaxReportsRow
  }, null)
}

async function loadHasAnyHistory(
  service: ServiceClient,
  userId:  string,
): Promise<boolean> {
  return safeQuery(async () => {
    const { data, error } = await service
      .from('income_entries')
      .select('id')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .limit(1)

    if (error) return false
    return (data ?? []).length > 0
  }, false)
}

// ─── Calendar event sources (all return CalendarEvent[]) ─────────────────────

async function eventsFromPlannedShifts(
  service:  ServiceClient,
  userId:   string,
  todayStr: string,
): Promise<CalendarEvent[]> {
  return safeQuery<CalendarEvent[]>(async () => {
    const { data, error } = await service
      .from('planned_shifts')
      .select('id, title, shift_date, expected_total_pay, expected_amount, module_type')
      .eq('user_id', userId)
      .gte('shift_date', todayStr)
      .is('deleted_at', null)
      .order('shift_date', { ascending: true })
      .limit(10)

    if (error) return []

    return (data ?? []).map((r: {
      id: string; title: string | null; shift_date: string
      expected_total_pay: number | null; expected_amount: number | null
    }): CalendarEvent => ({
      id:             r.id,
      title:          r.title ?? 'Planned shift',
      scheduledAt:    new Date(r.shift_date).toISOString(),
      type:           'shift',
      amountExpected: r.expected_total_pay ?? r.expected_amount ?? null,
    }))
  }, [])
}

async function eventsFromRentalBookings(
  service: ServiceClient,
  userId:  string,
  now:     Date,
): Promise<CalendarEvent[]> {
  return safeQuery<CalendarEvent[]>(async () => {
    const { data, error } = await service
      .from('rental_bookings')
      .select('id, title, start_datetime, start_at, expected_amount, total_amount')
      .eq('user_id', userId)
      .gte('start_datetime', now.toISOString())
      .is('deleted_at', null)
      .order('start_datetime', { ascending: true })
      .limit(10)

    if (error) return []

    return (data ?? []).map((r: {
      id: string; title: string | null
      start_datetime: string; start_at: string | null
      expected_amount: number | null; total_amount: number | null
    }): CalendarEvent => ({
      id:             r.id,
      title:          r.title ?? 'Rental booking',
      scheduledAt:    r.start_at ?? r.start_datetime,
      type:           'booking',
      amountExpected: r.expected_amount ?? r.total_amount ?? null,
    }))
  }, [])
}

async function eventsFromFreelanceEntries(
  service:  ServiceClient,
  userId:   string,
  todayStr: string,
): Promise<CalendarEvent[]> {
  return safeQuery<CalendarEvent[]>(async () => {
    const { data, error } = await service
      .from('freelance_entries')
      .select('id, service_name, job_title, due_date, gross_amount, net_amount, payment_status')
      .eq('user_id', userId)
      .gte('due_date', todayStr)
      .is('deleted_at', null)
      .order('due_date', { ascending: true })
      .limit(10)

    if (error) return []

    return (data ?? [])
      .filter((r: { payment_status: string | null }) =>
        r.payment_status !== 'paid' && r.payment_status !== 'received',
      )
      .map((r: {
        id: string; service_name: string | null; job_title: string | null
        due_date: string; gross_amount: number | null; net_amount: number | null
      }): CalendarEvent => ({
        id:             r.id,
        title:          r.service_name ?? r.job_title ?? 'Freelance payment due',
        scheduledAt:    new Date(r.due_date).toISOString(),
        type:           'other',
        amountExpected: r.gross_amount ?? r.net_amount ?? null,
      }))
  }, [])
}

async function eventsFromSalaryPaydays(
  service:  ServiceClient,
  userId:   string,
  todayStr: string,
): Promise<CalendarEvent[]> {
  return safeQuery<CalendarEvent[]>(async () => {
    const { data, error } = await service
      .from('salary_employment_profiles')
      .select('id, employer_name, next_pay_date, pay_amount')
      .eq('user_id', userId)
      .not('next_pay_date', 'is', null)
      .is('deleted_at', null)

    if (error || !data) return []

    return (data as Array<{
      id: string; employer_name: string | null
      next_pay_date: string | null; pay_amount: number | null
    }>)
      .filter(r => r.next_pay_date && r.next_pay_date >= todayStr)
      .map((r): CalendarEvent => ({
        id:             r.id,
        title:          r.employer_name ? `${r.employer_name} payday` : 'Salary payday',
        scheduledAt:    new Date(r.next_pay_date!).toISOString(),
        type:           'payday',
        amountExpected: r.pay_amount ?? null,
      }))
  }, [])
}

async function eventsFromSalaryLeave(
  service:  ServiceClient,
  userId:   string,
  todayStr: string,
): Promise<CalendarEvent[]> {
  return safeQuery<CalendarEvent[]>(async () => {
    const { data, error } = await service
      .from('salary_leave_entries')
      .select('id, leave_type, start_date, end_date, estimated_pay_impact')
      .eq('user_id', userId)
      .gte('start_date', todayStr)
      .is('deleted_at', null)
      .order('start_date', { ascending: true })
      .limit(5)

    if (error) return []

    return (data ?? []).map((r: {
      id: string; leave_type: string | null
      start_date: string; estimated_pay_impact: number | null
    }): CalendarEvent => {
      const leaveLabel = r.leave_type
        ? r.leave_type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
        : 'Leave'
      return {
        id:             r.id,
        title:          leaveLabel,
        scheduledAt:    new Date(r.start_date).toISOString(),
        type:           'other',
        amountExpected: r.estimated_pay_impact ?? null,
      }
    })
  }, [])
}

async function loadUpcomingEvents(
  service:  ServiceClient,
  userId:   string,
  now:      Date,
  todayStr: string,
): Promise<CalendarEvent[]> {
  const [shifts, rentals, freelance, paydays, leave] = await Promise.all([
    eventsFromPlannedShifts(service, userId, todayStr),
    eventsFromRentalBookings(service, userId, now),
    eventsFromFreelanceEntries(service, userId, todayStr),
    eventsFromSalaryPaydays(service, userId, todayStr),
    eventsFromSalaryLeave(service, userId, todayStr),
  ])

  const all = [...shifts, ...rentals, ...freelance, ...paydays, ...leave]
  all.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  return all.slice(0, 8)
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  const service     = createServiceClient()
  const now         = new Date()
  const todayStr    = toDateStr(now)
  const monthStart  = monthStartDateStr(now)
  const monthEnd    = monthEndDateStr(now)

  // Extend window back 13 days to capture a full 7-day trend even at month start
  const sevenDaysAgoStr = toDateStr(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000))
  const windowStart     = earlierDate(monthStart, sevenDaysAgoStr)

  // All queries run concurrently
  const [incomeRows, expenseRows, modules, goal, totalXp, upcomingEvents, taxProfile, hasAnyHistory] = await Promise.all([
    loadIncomeRows(service, userId, windowStart, monthEnd),
    loadExpenseRows(service, userId, windowStart, monthEnd),
    loadModules(service, userId),
    loadActiveGoal(service, userId),
    loadTotalXp(service, userId),
    loadUpcomingEvents(service, userId, now, todayStr),
    loadTaxReportsProfile(service, userId),
    loadHasAnyHistory(service, userId),
  ])

  // Scope rows to current month for financial summary
  const monthIncomeRows  = incomeRows.filter(r => r.entry_date  >= monthStart)
  const monthExpenseRows = expenseRows.filter(r => r.expense_date >= monthStart)

  const totalIncome   = monthIncomeRows.reduce((s, r) => s + rowIncomeAmount(r), 0)
  const totalExpenses = monthExpenseRows.reduce((s, r) => s + (r.amount ?? 0), 0)

  // --- Compass week-scoped inputs (Mon-Sun current week) --------------------
  const weekStart       = currentWeekStartStr(now)
  const weekEndDate     = new Date(weekStart)
  weekEndDate.setDate(weekEndDate.getDate() + 6)
  const weekEnd         = toDateStr(weekEndDate)

  const weekIncomeRows  = incomeRows.filter(r => r.entry_date >= weekStart && r.entry_date <= weekEnd)
  const weekExpenseRows = expenseRows.filter(r => r.expense_date >= weekStart && r.expense_date <= weekEnd)

  const weekIncome   = weekIncomeRows.reduce((s, r) => s + rowIncomeAmount(r), 0)
  const weekExpenses = weekExpenseRows.reduce((s, r) => s + (r.amount ?? 0), 0)

  // Per-day totals for active days (for consistency variance calc)
  const dailyMap: Record<string, number> = {}
  for (const r of weekIncomeRows) {
    const amt = rowIncomeAmount(r)
    if (amt > 0) dailyMap[r.entry_date] = (dailyMap[r.entry_date] ?? 0) + amt
  }
  const weekActiveDays   = Object.keys(dailyMap).length
  const weekDailyAmounts = Object.values(dailyMap)

  // Category coverage for week expenses
  const weekExpenseCount = weekExpenseRows.length
  const weekCategorised  = weekExpenseRows.filter(r => (r.category ?? '').trim().length > 0).length
  const categoryCoverage = weekExpenseCount > 0 ? weekCategorised / weekExpenseCount : 0

  // Tax setup acknowledged
  const reportSetupAcknowledged =
    taxProfile !== null &&
    Boolean(taxProfile.ato_setup_completed || taxProfile.manual_setup_completed || taxProfile.tax_disabled)

  // Derive all secondary datasets in memory (no extra DB calls)
  const weeklyTrend    = deriveWeeklyTrend(incomeRows, expenseRows, now)
  const moduleBreakdown = deriveModuleBreakdown(monthIncomeRows, totalIncome)
  const recentActivity  = deriveRecentActivity(incomeRows, expenseRows)

  const compass = computeCompassScore({
    weekIncome,
    weekExpenses,
    weekActiveDays,
    weekDailyAmounts,
    hasAnyHistory,
    reportSetupAcknowledged,
    categoryCoverage,
    weekExpenseCount,
    goalPaceStatus: deriveGoalPaceStatus(goal, now),
  })

  return {
    summary: {
      totalIncome,
      totalExpenses,
      netIncome:   totalIncome - totalExpenses,
      currency:    'AUD',
      periodLabel: formatPeriodLabel(),
    },
    modules,
    goal,
    totalXp,
    xpLevel:        xpToLevel(totalXp),
    upcomingEvents,
    recentActivity,
    moduleBreakdown,
    weeklyTrend,
    compass,
    hasAnyData: totalIncome > 0 || totalExpenses > 0 || upcomingEvents.length > 0,
  }
}
