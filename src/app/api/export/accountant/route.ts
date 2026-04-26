/**
 * GET /api/export/accountant
 *
 * Downloads a comprehensive accountant summary CSV combining income,
 * expenses, and goals for the authenticated premium user.
 */
import { NextResponse } from 'next/server'
import { createClient }          from '@/lib/supabase/server'
import { createServiceClient }   from '@/lib/supabase/service'
import { accountantSummaryToCSV } from '@/lib/csv-utils'
import type { IncomeExportRow, ExpenseExportRow, GoalExportRow } from '@/lib/csv-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: entitlement } = await service
    .from('premium_entitlements')
    .select('is_active')
    .eq('user_id', user.id)
    .single()

  if (entitlement?.is_active !== true) {
    return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
  }

  // Fetch all three datasets concurrently
  const [incomeResult, expenseResult, goalResult] = await Promise.all([
    service
      .from('income_entries')
      .select('entry_date, source, title, gross_amount, net_amount, amount, platform, status, notes_text')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('entry_date', { ascending: false }),
    service
      .from('expense_entries')
      .select('expense_date, amount, category, item_name, title, status, notes_text')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('expense_date', { ascending: false }),
    service
      .from('goal_plans')
      .select('title, target_amount, current_amount, is_active, status, module_type, start_date, end_date, target_date, completed_at, created_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
  ])

  const today    = new Date().toISOString().split('T')[0]
  const csv      = accountantSummaryToCSV(
    (incomeResult.data  ?? []) as IncomeExportRow[],
    (expenseResult.data ?? []) as ExpenseExportRow[],
    (goalResult.data    ?? []) as GoalExportRow[],
    today,
  )
  const filename = `polarispilot-accountant-summary-${today}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store, no-cache',
    },
  })
}
