/**
 * Dashboard data loader -- SERVER ONLY.
 *
 * Loads all data required for the Phase 1 premium dashboard in a single
 * orchestrated call. Every Supabase query falls back gracefully so the
 * dashboard always renders even when tables are empty or not yet seeded.
 *
 * Table names match the PolarisPilot mobile app schema. If a table does
 * not exist for a user the query returns an empty result and the UI shows
 * a "no data" state rather than an error.
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

export interface GoalData {
  label:         string
  currentAmount: number
  targetAmount:  number
  progressPct:   number
  xp:            number
  level:         number
}

export interface CalendarEvent {
  id:             string
  title:          string
  scheduledAt:    string
  type:           'shift' | 'payday' | 'booking' | 'other'
  amountExpected: number | null
}

export interface DashboardData {
  summary:        SummaryData
  modules:        ModuleData
  goal:           GoalData | null
  upcomingEvents: CalendarEvent[]
  hasAnyData:     boolean
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Run a function that returns a value. If it throws for any reason
 * (network error, unexpected shape) the fallback is returned instead.
 */
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

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loadDashboardData(userId: string): Promise<DashboardData> {
  const service = createServiceClient()

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()

  // ── Income (current month) ─────────────────────────────────────────────
  const totalIncome = await safeQuery(async () => {
    const { data, error } = await service
      .from('income_entries')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', monthStart)
      .lte('date', monthEnd)

    if (error) return 0
    return (data ?? []).reduce(
      (sum: number, r: { amount: number | null }) => sum + (r.amount ?? 0),
      0,
    )
  }, 0)

  // ── Expenses (current month) ───────────────────────────────────────────
  const totalExpenses = await safeQuery(async () => {
    const { data, error } = await service
      .from('expense_entries')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', monthStart)
      .lte('date', monthEnd)

    if (error) return 0
    return (data ?? []).reduce(
      (sum: number, r: { amount: number | null }) => sum + (r.amount ?? 0),
      0,
    )
  }, 0)

  // ── Active modules ─────────────────────────────────────────────────────
  const modules = await safeQuery(async () => {
    const { data, error } = await service
      .from('user_modules')
      .select('name')
      .eq('user_id', userId)
      .eq('enabled', true)

    if (error) return { active: [] as string[], count: 0 }
    const active = (data ?? []).map((r: { name: string }) => r.name)
    return { active, count: active.length }
  }, { active: [] as string[], count: 0 })

  // ── Goal / XP ──────────────────────────────────────────────────────────
  const goal = await safeQuery<GoalData | null>(async () => {
    const { data, error } = await service
      .from('goals')
      .select('label, current_amount, target_amount, xp_points, level')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    const row = data as {
      label: string | null
      current_amount: number | null
      target_amount: number | null
      xp_points: number | null
      level: number | null
    }

    const current = row.current_amount ?? 0
    const target  = row.target_amount  ?? 0
    const progressPct = target > 0
      ? Math.min(100, Math.round((current / target) * 100))
      : 0

    return {
      label:         row.label          ?? 'Monthly Income Goal',
      currentAmount: current,
      targetAmount:  target,
      progressPct,
      xp:            row.xp_points ?? 0,
      level:         row.level     ?? 1,
    }
  }, null)

  // ── Upcoming calendar events ───────────────────────────────────────────
  const upcomingEvents = await safeQuery<CalendarEvent[]>(async () => {
    const { data, error } = await service
      .from('calendar_events')
      .select('id, title, scheduled_at, type, amount_expected')
      .eq('user_id', userId)
      .gte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5)

    if (error) return []

    return (data ?? []).map((r: {
      id: string
      title: string | null
      scheduled_at: string
      type: string | null
      amount_expected: number | null
    }): CalendarEvent => ({
      id:             r.id,
      title:          r.title          ?? 'Event',
      scheduledAt:    r.scheduled_at,
      type:           (['shift', 'payday', 'booking'].includes(r.type ?? '')
                        ? r.type
                        : 'other') as CalendarEvent['type'],
      amountExpected: r.amount_expected ?? null,
    }))
  }, [])

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
    upcomingEvents,
    hasAnyData: totalIncome > 0 || totalExpenses > 0 || upcomingEvents.length > 0,
  }
}
