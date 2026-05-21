/**
 * POST /api/revenuecat/webhook
 *
 * Receives RevenueCat server-to-server events and keeps
 * public.premium_entitlements in sync.
 *
 * Security hardening applied:
 *   - Authorization compared with crypto.timingSafeEqual (no timing oracle).
 *   - event.event_timestamp_ms validated; events >5 min stale are rejected.
 *   - Rate limited per IP (20 req / 60 s per lambda instance) to prevent
 *     flooding. Legitimate RC retries are well within this limit.
 *   - All log statements are redacted: no UUIDs, user IDs or email values.
 *
 * Identity mapping:
 *   event.app_user_id  =  profiles.master_account_uuid  (set by the mobile app)
 *   profiles.id        =  auth.users.id                 (PK of premium_entitlements)
 */
import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchRevenueCatSubscriber, mapRevenueCatSubscriber } from '@/lib/revenuecat'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/** Maximum clock-drift / delivery delay tolerated (5 minutes). */
const MAX_EVENT_AGE_MS = 5 * 60 * 1000

interface RevenueCatWebhookBody {
  event?: {
    app_user_id?:         string
    type?:                string
    event_timestamp_ms?:  number
    [key: string]:        unknown
  }
  api_version?: string
}

/**
 * Constant-time string comparison to prevent timing-oracle attacks on the
 * shared webhook secret.
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  // ── 0. Rate limit per IP (20 req / 60 s) ─────────────────────────────────
  // Legitimate RevenueCat retries are infrequent; this limit is generous.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = rateLimit(`webhook:${ip}`, 20, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSecs) },
      },
    )
  }

  // ── 1. Verify shared-secret Authorization header (timing-safe) ────────────
  const expectedAuth = process.env.REVENUECAT_WEBHOOK_AUTH
  if (!expectedAuth) {
    console.error('[webhook] REVENUECAT_WEBHOOK_AUTH env var is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('Authorization') ?? ''
  if (!secureCompare(authHeader, expectedAuth)) {
    console.warn('[webhook] Rejected -- Authorization mismatch')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse the event ────────────────────────────────────────────────────
  let body: RevenueCatWebhookBody
  try {
    body = (await request.json()) as RevenueCatWebhookBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const masterUuid  = body?.event?.app_user_id
  const eventType   = body?.event?.type ?? 'UNKNOWN'
  const eventTsMs   = body?.event?.event_timestamp_ms

  if (!masterUuid) {
    return NextResponse.json({ error: 'Missing event.app_user_id' }, { status: 400 })
  }

  // ── 3. Replay / stale-event protection ───────────────────────────────────
  // RevenueCat always includes event_timestamp_ms in its webhook payloads.
  // Ref: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
  if (typeof eventTsMs === 'number') {
    const ageMs = Date.now() - eventTsMs
    if (ageMs > MAX_EVENT_AGE_MS) {
      // Return 200 so RevenueCat stops retrying a genuinely stale event.
      console.warn(`[webhook] Stale ${eventType} event discarded (age ${Math.round(ageMs / 1000)}s)`)
      return NextResponse.json({ ok: true, skipped: true, reason: 'stale' })
    }
  } else {
    // No timestamp present -- log a warning but continue processing.
    // RevenueCat may send test events or future payload shapes without it.
    console.warn(`[webhook] ${eventType} event missing event_timestamp_ms -- processing without replay check`)
  }

  // Redacted log: event type only, no user identifiers
  console.log(`[webhook] Processing ${eventType} event`)

  const service = createServiceClient()

  // ── 4. Reverse-lookup: master_account_uuid → auth.users.id ───────────────
  const { data: profile, error: lookupError } = await service
    .from('profiles')
    .select('id')
    .eq('master_account_uuid', masterUuid)
    .single()

  if (lookupError || !profile) {
    // RC user not yet registered on the website -- return 200 to stop retries.
    console.warn(`[webhook] ${eventType} -- no matching profile found, skipping upsert`)
    return NextResponse.json({ ok: true, skipped: true })
  }

  const authUserId = profile.id

  // ── 5. Fetch latest subscriber state from RevenueCat ─────────────────────
  let subscriber
  try {
    subscriber = await fetchRevenueCatSubscriber(masterUuid)
  } catch (err) {
    console.error('[webhook] RevenueCat fetch failed:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'RevenueCat fetch failed' }, { status: 502 })
  }

  // ── 6. Map and upsert ─────────────────────────────────────────────────────
  const mapped = mapRevenueCatSubscriber(subscriber)
  const now    = new Date().toISOString()

  const { error: upsertError } = await service
    .from('premium_entitlements')
    .upsert(
      {
        user_id:                authUserId,
        revenuecat_app_user_id: masterUuid,
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
    return NextResponse.json({ error: 'DB upsert failed' }, { status: 500 })
  }

  // Redacted success log: no user identifiers
  console.log(`[webhook] ${eventType} upserted: is_active=${mapped.is_active}, entitlement=${mapped.entitlement ?? 'none'}`)

  return NextResponse.json({ ok: true })
}
