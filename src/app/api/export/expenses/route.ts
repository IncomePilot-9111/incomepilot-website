/**
 * GET /api/export/expenses
 *
 * Downloads all expense entries for the authenticated premium user as CSV.
 */
import { NextResponse } from 'next/server'
import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { expensesToCSV }       from '@/lib/csv-utils'
import type { ExpenseExportRow } from '@/lib/csv-utils'

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

  const { data: rows, error } = await service
    .from('expense_entries')
    .select('expense_date, amount, category, item_name, title, status, notes_text')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('expense_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch expense data' }, { status: 500 })
  }

  const csv      = expensesToCSV((rows ?? []) as ExpenseExportRow[])
  const today    = new Date().toISOString().split('T')[0]
  const filename = `polarispilot-expense-export-${today}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store, no-cache',
    },
  })
}
