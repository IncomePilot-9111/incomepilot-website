/**
 * GET /api/export/goals
 *
 * Downloads all goals for the authenticated premium user as CSV.
 */
import { NextResponse } from 'next/server'
import { createClient }        from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { goalsToCSV }          from '@/lib/csv-utils'
import type { GoalExportRow }   from '@/lib/csv-utils'

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
    .from('goal_plans')
    .select(
      'title, target_amount, current_amount, is_active, status, module_type, ' +
      'start_date, end_date, target_date, completed_at, created_at',
    )
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch goals data' }, { status: 500 })
  }

  const csv      = goalsToCSV((rows ?? []) as unknown as GoalExportRow[])
  const today    = new Date().toISOString().split('T')[0]
  const filename = `polarispilot-goals-export-${today}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store, no-cache',
    },
  })
}
