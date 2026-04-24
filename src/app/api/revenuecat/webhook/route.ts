/**
 * POST /api/revenuecat/webhook
 *
 * Receives RevenueCat server-to-server webhook events (purchase, renewal,
 * cancellation, expiration, etc.) and keeps public.premium_entitlements in
 * sync without requiring the user to be online.
 *
 * Security: The Authorization header must match REVENUECAT_WEBHOOK_AUTH.
 * Set this shared secret in RevenueCat Dashboard → Integrations → Webhooks
 * → "Authorization header" and mirror it in Vercel env vars.
 *
 * RevenueCat webhook payload reference:
 *   https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchRevenueCatSubscriber, mapRevenueCatSubscriber } from '@/lib/revenuecat'

export const dynamic = 'force-dynamic'

// Minimal typing for the RevenueCat webhook payload
interface RevenueCatWebhookBody {
  event?: {
    app_user_id?: string
    type?:        string
    [key: string]: unknown
  }
  api_version?: string
}

export async function POST(request: NextRequest) {
  // ── 1. Verify shared-secret Authorization header ───────────────────────
  const expectedAuth = process.env.REVENUECAT_WEBHOOK_AUTH
  if (!expectedAuth) {
    console.error('[webhook] REVENUECAT_WEBHOOK_AUTH env var is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('Authorization')
  if (authHeader !== expectedAuth) {
    console.warn('[webhook] Rejected request — Authorization mismatch')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse the event body ────────────────────────────────────────────
  let body: RevenueCatWebhookBody
  try {
    body = (await request.json()) as RevenueCatWebhookBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const appUserId  = body?.event?.app_user_id
  const eventType  = body?.event?.type ?? 'UNKNOWN'

  if (!appUserId) {
    return NextResponse.json({ error: 'Missing event.app_user_id' }, { status: 400 })
  }

  console.log(`[webhook] Received ${eventType} for appUserId=${appUserId}`)

  // ── 3. Fetch the latest subscriber state from RevenueCat ──────────────
  let subscriber
  try {
    subscriber = await fetchRevenueCatSubscriber(appUserId)
  } catch (err) {
    console.error('[webhook] RevenueCat fetch failed:', err)
    // Return 502 so RevenueCat retries the webhook
    return NextResponse.json({ error: 'RevenueCat fetch failed' }, { status: 502 })
  }

  // ── 4. Map and upsert ─────────────────────────────────────────────────
  const mapped = mapRevenueCatSubscriber(subscriber)
  const now    = new Date().toISOString()

  const service = createServiceClient()
  const { error: upsertError } = await service
    .from('premium_entitlements')
    .upsert(
      {
        user_id:                appUserId,
        revenuecat_app_user_id: appUserId,
        is_active:              mapped.is_active,
        entitlement:            mapped.entitlement,
        product_id:             mapped.product_id,
        store:                  mapped.store,
        expires_at:             mapped.expires_at,
        last_checked_at:        now,
        updated_at:             now,
      },
      { onConflict: 'user_id' },
    )

  if (upsertError) {
    console.error('[webhook] Upsert failed:', upsertError.message)
    // Return 500 so RevenueCat retries
    return NextResponse.json({ error: 'DB upsert failed' }, { status: 500 })
  }

  console.log(
    `[webhook] Upserted ${appUserId}: is_active=${mapped.is_active}, entitlement=${mapped.entitlement}`,
  )

  return NextResponse.json({ ok: true })
}
