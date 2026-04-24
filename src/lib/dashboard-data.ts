/**
 * Dashboard data loader -- SERVER ONLY.
 *
 * Loads all data required for the Phase 1 premium dashboard.
 * Every query targets the real PolarisPilot Supabase sync tables with
 * the verified column names from v1_schema.sql and salary migration files.
 *
 * All queries are read-only and fall back gracefully: if a table returns
 * an error or is empty the dashboard still renders with zero/null/[] values.
 *
 * Soft-deleted rows are excluded (deleted_at IS NULL) on every query.
 *
 * Note: date filtering uses UTC-based boundaries. Data stored in AEST will be
 * off by the UTC+10/+11 offset at day boundaries -- acceptable for Phase 1.
 */
import { createServiceClient } from '@/lib/supabase/service'

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

/** Goal progress without XP -- XP lives at top level of DashboardData */
export interface GoalData {
  label:         string
  currentAmount: number
  targetAmount:  number
  progressPct:   number
}

export interface CalendarEvent {
  id:             string
  title:          string
  scheduledAt:    string        // ISO string -- sort key
  type:           'shift' | 'payday' | 'booking' | 'other'
  amountExpected: number | null
}

export interface DashboardData {
  summary:        SummaryData
  modules:        ModuleData
  goal:           GoalData | null
  totalXp:        number        // sum of premium_xp_ledger.amount
  xpLevel:        number        // derived from totalXp (500 XP per level)
  upcomingEvents: CalendarEvent[]
  hasAnyData:     boolean
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/** Absorb any thrown error and return the fallback instead */
async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

/** Current month label: "June 2025" */
function formatPeriodLabel(): string {
  return new Date().toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
}

/** YYYY-MM-DD string for a Date (used when filtering date-type columns) */
function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

/** First day of the current month as YYYY-MM-DD */
function monthStartDateStr(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

/** Last day of the current month as YYYY-MM-DD */
function monthEndDateStr(now: Date): string {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

/**
 * XP-to-level mapping (500 XP per level, starting at level 1).
 * Level 1 = 0-499 XP, Level 2 = 500-999 XP, etc.
 */
export function xpToLevel(xp: number): number {
  return Math.floor(Math.max(0, xp) / 500) + 1
}

/**
 * Parse a workspace_preferences module JSON column.
 * The column is stored as JSONB -- Supabase returns it already parsed as an
 * array or object. This handles both the parsed and string fallback cases.
 */
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

// ─── Per-source loaders ───────────────────────────────────────────────────────

// Intentionally typed as unknown to avoid @supabase/supabase-js import in test env
type ServiceClient = ReturnType<typeof createServiceClient>

async function loadIncome(
  service: ServiceClient,
  userId:  string,
  start:   string,
  end:     string,
): Promise<number> {
  return safeQuery(async () => {
    const { data, error } = await service
      .from('income_entries')
      .select('gross_amount, net_amount, amount')
      .eq('user_id', userId)
      .gte('entry_date', start)
      .lte('entry_date', end)
      .is('deleted_at', null)

    if (error) return 0
    return (data ?? []).reduce(
      (sum: number, r: { gross_amount: number | null; net_amount: number | null; amount: number | null }) =>
        sum + (r.gross_amount ?? r.net_amount ?? r.amount ?? 0),
      0,
    )
  }, 0)
}

async function loadExpenses(
  service: ServiceClient,
  userId:  string,
  start:   string,
  end:     string,
): Promise<number> {
  return safeQuery(async () => {
    const { data, error } = await service
      .from('expense_entries')
      .select('amount')
      .eq('user_id', userId)
      .gte('expense_date', start)
      .lte('expense_date', end)
      .is('deleted_at', null)

    if (error) return 0
    return (data ?? []).reduce(
      (sum: number, r: { amount: number | null }) => sum + (r.amount ?? 0),
      0,
    )
  }, 0)
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

    const row = data as {
      enabled_modules_json: unknown
      primary_modules_json: unknown
    }

    // Prefer enabled_modules_json; fall back to primary_modules_json
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
      is_active:      boolean
      status:         string | null
    }

    const current = row.current_amount ?? 0
    const target  = row.target_amount  ?? 0

    return {
      label:         row.title          ?? 'Income Goal',
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
    return (data ?? []).reduce(
      (sum: number, r: { amount: number | null }) => sum + (r.amount ?? 0),
      0,
    )
  }, 0)
}

// ─── Calendar event sources ───────────────────────────────────────────────────

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
      id:                 string
      title:              string | null
      shift_date:         string
      expected_total_pay: number | null
      expected_amount:    number | null
      module_type:        string | null
    }): CalendarEvent => ({
      id:             r.id,
      title:          r.title ?? 'Planned shift',
      // shift_date is a date column (YYYY-MM-DD) -- convert to ISO for uniform sorting
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
      .select('id, title, start_datetime, start_at, expected_amount, total_amount, booking_status, status')
      .eq('user_id', userId)
      // start_datetime is NOT NULL in the schema -- safe to filter on
      .gte('start_datetime', now.toISOString())
      .is('deleted_at', null)
      .order('start_datetime', { ascending: true })
      .limit(10)

    if (error) return []

    return (data ?? []).map((r: {
      id:              string
      title:           string | null
      start_datetime:  string
      start_at:        string | null
      expected_amount: number | null
      total_amount:    number | null
      booking_status:  string | null
      status:          string | null
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
      // Exclude already-paid entries
      .filter((r: { payment_status: string | null }) =>
        r.payment_status !== 'paid' && r.payment_status !== 'received',
      )
      .map((r: {
        id:              string
        service_name:    string | null
        job_title:       string | null
        due_date:        string
        gross_amount:    number | null
        net_amount:      number | null
        payment_status:  string | null
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
    // next_pay_date is stored as text in the schema (nullable)
    const { data, error } = await service
      .from('salary_employment_profiles')
      .select('id, employer_name, next_pay_date, pay_amount')
      .eq('user_id', userId)
      .not('next_pay_date', 'is', null)
      .is('deleted_at', null)

    if (error || !data) return []

    return (data as Array<{
      id:            string
      employer_name: string | null
      next_pay_date: string | null
      pay_amount:    number | null
    }>)
      .filter((r) => {
        // Parse text date -- safeguard against unexpected format
        if (!r.next_pay_date) return false
        try {
          return r.next_pay_date >= todayStr
        } catch {
          return false
        }
      })
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
      id:                   string
      leave_type:           string | null
      start_date:           string
      end_date:             string
      estimated_pay_impact: number | null
    }): CalendarEvent => {
      const leaveLabel = r.leave_type
        ? r.leave_type.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
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
  // Query all five sources concurrently -- each falls back to [] on error
  const [shifts, rentals, freelance, paydays, leave] = await Promise.all([
    eventsFromPlannedShifts(service, userId, todayStr),
    eventsFromRentalBookings(service, userId, now),
    eventsFromFreelanceEntries(service, userId, todayStr),
    eventsFromSalaryPaydays(service, userId, todayStr),
    eventsFromSalaryLeave(service, userId, todayStr),
  ])

  const all = [...shifts, ...rentals, ...freelance, ...paydays, ...leave]

  // Sort chronologically by ISO scheduledAt string (lexicographic sort works for ISO dates)
  all.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))

  // Return at most 8 upcoming events on the dashboard
  return all.slice(0, 8)
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  const service  = createServiceClient()
  const now      = new Date()
  const todayStr = toDateStr(now)
  const start    = monthStartDateStr(now)
  const end      = monthEndDateStr(now)

  // Run all top-level queries concurrently
  const [totalIncome, totalExpenses, modules, goal, totalXp, upcomingEvents] = await Promise.all([
    loadIncome(service, userId, start, end),
    loadExpenses(service, userId, start, end),
    loadModules(service, userId),
    loadActiveGoal(service, userId),
    loadTotalXp(service, userId),
    loadUpcomingEvents(service, userId, now, todayStr),
  ])

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
    xpLevel:    xpToLevel(totalXp),
    upcomingEvents,
    hasAnyData: totalIncome > 0 || totalExpenses > 0 || upcomingEvents.length > 0,
  }
}
