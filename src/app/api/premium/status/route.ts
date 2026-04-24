/**
 * GET /api/premium/status
 *
 * Server-only endpoint. Flow:
 *
 *   1. Verify Supabase session  →  auth.users.id
 *   2. Look up profiles.master_account_uuid  (the RevenueCat appUserID
 *      set by the mobile app — NOT the same as auth.users.id)
 *   3. Call RevenueCat REST API using master_account_uuid
 *   4. Upsert premium_entitlements:
 *        user_id                = auth.users.id
 *        revenuecat_app_user_id = master_account_uuid
 *   5. Return live premium status
 *
 * Falls back to the cached DB row when RevenueCat is unreachable.
 * Falls back to is_active=false when master_account_uuid is not yet set
 * (user has never opened the mobile app).
 *
 * No secret keys are returned in the response.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchRevenueCatSubscriber, mapRevenueCatSubscriber } from '@/lib/revenuecat'

export const dynamic = 'force-dynamic'

export async function GET() {
  // ── 1. Verify Supabase session ─────────────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
      },
    },
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const authUserId = user.id
  const service    = createServiceClient()

  // ── 2. Resolve master_account_uuid from profiles ───────────────────────
  // The mobile app sets this UUID; it is the RevenueCat appUserID.
  // It is NOT the same as auth.users.id.
  const { data: profile, error: profileError } = await service
    .from('profiles')
    .select('master_account_uuid')
    .eq('id', authUserId)
    .single()

  if (profileError) {
    console.error('[/api/premium/status] profile lookup error:', profileError.message)
  }

  const masterUuid: string | null = profile?.master_account_uuid ?? null

  if (!masterUuid) {
    // User has not opened the mobile app yet — no RC identity, not premium.
    // Return cached row if it exists, otherwise default to free.
    const { data: cached } = await service
      .from('premium_entitlements')
      .select('is_active, entitlement, product_id, store, expires_at')
      .eq('user_id', authUserId)
      .single()

    return NextResponse.json({
      is_active:   cached?.is_active   ?? false,
      entitlement: cached?.entitlement ?? 'pro',
      product_id:  cached?.product_id  ?? null,
      store:       cached?.store       ?? null,
      expires_at:  cached?.expires_at  ?? null,
      source:      'cache',
      notice:      'App not yet linked. Open the PolarisPilot app to connect your account.',
    })
  }

  // ── 3. Fetch live status from RevenueCat ───────────────────────────────
  try {
    const subscriber = await fetchRevenueCatSubscriber(masterUuid)
    const mapped     = mapRevenueCatSubscriber(subscriber)

    // ── 4. Upsert premium_entitlements ──────────────────────────────────
    const now = new Date().toISOString()
    const { error: upsertError } = await service
      .from('premium_entitlements')
      .upsert(
        {
          user_id:                authUserId,   // auth.users.id — the PK
          revenuecat_app_user_id: masterUuid,   // master_account_uuid from profiles
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
      console.error('[/api/premium/status] upsert error:', upsertError.message)
      // Non-fatal — still return the live RC data
    }

    return NextResponse.json({
      is_active:   mapped.is_active,
      entitlement: mapped.entitlement,
      product_id:  mapped.product_id,
      store:       mapped.store,
      expires_at:  mapped.expires_at,
      source:      'revenuecat',
    })
  } catch (rcError) {
    // ── 5. RevenueCat unreachable — fall back to DB cache ─────────────────
    console.warn('[/api/premium/status] RevenueCat unreachable, using cache:', rcError)

    const { data: cached } = await service
      .from('premium_entitlements')
      .select('is_active, entitlement, product_id, store, expires_at')
      .eq('user_id', authUserId)
      .single()

    return NextResponse.json({
      is_active:   cached?.is_active   ?? false,
      entitlement: cached?.entitlement ?? 'pro',
      product_id:  cached?.product_id  ?? null,
      store:       cached?.store       ?? null,
      expires_at:  cached?.expires_at  ?? null,
      source:      'cache',
    })
  }
}
