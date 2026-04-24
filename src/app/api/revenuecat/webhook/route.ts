/**
 * POST /api/revenuecat/webhook
 *
 * Receives RevenueCat server-to-server events and keeps
 * public.premium_entitlements in sync.
 *
 * Identity mapping:
 *   event.app_user_id  =  profiles.master_account_uuid  (set by the mobile app)
 *   profiles.id        =  auth.users.id                 (PK of premium_entitlements)
 *
 * The webhook performs a reverse lookup:
 *   master_account_uuid  →  profiles.id  →  premium_entitlements.user_id
 *
 * RevenueCat webhook payload reference:
 *   https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchRevenueCatSubscriber, mapRevenueCatSubscriber } from '@/lib/revenuecat'

export const dynamic = 'force-dynamic'

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
    console.warn('[webhook] Rejected — Authorization mismatch')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse the event ────────────────────────────────────────────────
  let body: RevenueCatWebhookBody
  try {
    body = (await request.json()) as RevenueCatWebhookBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // app_user_id from the mobile app == profiles.master_account_uuid
  const masterUuid = body?.event?.app_user_id
  const eventType  = body?.event?.type ?? 'UNKNOWN'

  if (!masterUuid) {
    return NextResponse.json({ error: 'Missing event.app_user_id' }, { status: 400 })
  }

  console.log(`[webhook] ${eventType} — master_account_uuid=${masterUuid}`)

  const service = createServiceClient()

  // ── 3. Reverse-lookup: master_account_uuid → auth.users.id ─────────────
  // The profiles table is indexed on master_account_uuid for this query.
  const { data: profile, error: lookupError } = await service
    .from('profiles')
    .select('id')          // id = auth.users.id
    .eq('master_account_uuid', masterUuid)
    .single()

  if (lookupError || !profile) {
    // Could be a RevenueCat user who hasn't signed up on the website yet,
    // or a test/anonymous RC user. Return 200 so RC does not retry endlessly.
    console.warn(
      `[webhook] No profile found for master_account_uuid=${masterUuid} — skipping upsert`,
    )
    return NextResponse.json({ ok: true, skipped: true })
  }

  const authUserId = profile.id   // auth.users.id

  // ── 4. Fetch latest subscriber state from RevenueCat ──────────────────
  let subscriber
  try {
    subscriber = await fetchRevenueCatSubscriber(masterUuid)
  } catch (err) {
    console.error('[webhook] RevenueCat fetch failed:', err)
    // Return 502 so RevenueCat retries
    return NextResponse.json({ error: 'RevenueCat fetch failed' }, { status: 502 })
  }

  // ── 5. Map and upsert ─────────────────────────────────────────────────
  const mapped = mapRevenueCatSubscriber(subscriber)
  const now    = new Date().toISOString()

  const { error: upsertError } = await service
    .from('premium_entitlements')
    .upsert(
      {
        user_id:                authUserId,   // auth.users.id
        revenuecat_app_user_id: masterUuid,   // profiles.master_account_uuid
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
    `[webhook] Upserted authUserId=${authUserId} ` +
    `(master=${masterUuid}): is_active=${mapped.is_active}, entitlement=${mapped.entitlement}`,
  )

  return NextResponse.json({ ok: true })
}
