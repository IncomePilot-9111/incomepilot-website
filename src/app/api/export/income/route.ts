/**
 * GET /api/export/income
 *
 * Downloads all income entries for the authenticated premium user as CSV.
 * Returns 401 if not logged in, 403 if not premium, 200 with CSV otherwise.
 */
import { NextResponse } from 'next/server'
import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { incomeToCSV }         from '@/lib/csv-utils'
import type { IncomeExportRow } from '@/lib/csv-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Premium check
  const service = createServiceClient()
  const { data: entitlement } = await service
    .from('premium_entitlements')
    .select('is_active')
    .eq('user_id', user.id)
    .single()

  if (entitlement?.is_active !== true) {
    return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
  }

  // 3. Fetch all income entries
  const { data: rows, error } = await service
    .from('income_entries')
    .select('entry_date, source, title, gross_amount, net_amount, amount, platform, status, notes_text')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('entry_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch income data' }, { status: 500 })
  }

  const csv      = incomeToCSV((rows ?? []) as IncomeExportRow[])
  const today    = new Date().toISOString().split('T')[0]
  const filename = `polarispilot-income-export-${today}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store, no-cache',
    },
  })
}
