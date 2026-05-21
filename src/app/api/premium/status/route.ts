/**
 * GET /api/premium/status
 *
 * Server-only endpoint. Flow:
 *
 *   1. Rate-limit by IP (10 req / 60 s per lambda instance).
 *   2. Verify Supabase session  →  auth.users.id
 *   3. If cached DB row is fresh (<= 5 min old) return it immediately.
 *   4. Look up profiles.master_account_uuid  (the RevenueCat appUserID).
 *   5. Call RevenueCat REST API using master_account_uuid.
 *   6. Upsert premium_entitlements and return live status.
 *
 * Falls back to the cached DB row when RevenueCat is unreachable.
 * Falls back to is_active=false when master_account_uuid is not set.
 *
 * No secret keys are returned in the response.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies }            from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient }       from '@/lib/supabase/service'
import { fetchRevenueCatSubscriber, mapRevenueCatSubscriber } from '@/lib/revenuecat'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/** 5 minutes in milliseconds -- max age for the cached entitlement row */
const CACHE_TTL_MS = 5 * 60 * 1000

export async function GET(request: NextRequest) {
  // ── 0. Rate limit by IP (10 requests per 60 s per lambda instance) ────────
  const ip  = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl  = rateLimit(`premium-status:${ip}`, 10, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSecs) },
      },
    )
  }

  // ── 1. Verify Supabase session ─────────────────────────────────────────────
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

  // ── 2. Check cached entitlement row (skip RevenueCat if fresh) ─────────────
  const { data: cached } = await service
    .from('premium_entitlements')
    .select('is_active, entitlement, product_id, store, expires_at, last_checked_at')
    .eq('user_id', authUserId)
    .single()

  if (cached?.last_checked_at) {
    const ageMs = Date.now() - new Date(cached.last_checked_at).getTime()
    if (ageMs < CACHE_TTL_MS) {
      // Cache is fresh -- skip RevenueCat call entirely
      return NextResponse.json({
        ok:          true,
        isActive:    cached.is_active    ?? false,
        entitlement: cached.entitlement  ?? null,
        productId:   cached.product_id   ?? null,
        store:        cached.store       ?? null,
        expiresAt:   cached.expires_at   ?? null,
        fromCache:   true,
      })
    }
  }

  // ── 3. Resolve master_account_uuid from profiles ───────────────────────────
  const { data: profile, error: profileError } = await service
    .from('profiles')
    .select('master_account_uuid')
    .eq('id', authUserId)
    .single()

  if (profileError) {
    console.error('[/api/premium/status] profile lookup error (non-fatal)')
  }

  const masterUuid: string | null = profile?.master_account_uuid ?? null

  if (!masterUuid) {
    // User has not opened the mobile app -- return cached row or free default
    return NextResponse.json({
      ok:          true,
      isActive:    cached?.is_active   ?? false,
      entitlement: cached?.entitlement ?? null,
      productId:   cached?.product_id  ?? null,
      store:        cached?.store       ?? null,
      expiresAt:   cached?.expires_at  ?? null,
    })
  }

  // ── 4. Fetch live status from RevenueCat ───────────────────────────────────
  try {
    const subscriber = await fetchRevenueCatSubscriber(masterUuid)
    const mapped     = mapRevenueCatSubscriber(subscriber)

    // ── 5. Upsert premium_entitlements ──────────────────────────────────────
    const now = new Date().toISOString()
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
      console.error('[/api/premium/status] upsert error (non-fatal)')
    }

    return NextResponse.json({
      ok:          true,
      isActive:    mapped.is_active,
      entitlement: mapped.entitlement,
      productId:   mapped.product_id,
      store:        mapped.store,
      expiresAt:   mapped.expires_at,
    })
  } catch {
    // ── 6. RevenueCat unreachable -- fall back to DB cache ────────────────────
    console.warn('[/api/premium/status] RevenueCat unreachable, using cache')

    return NextResponse.json({
      ok:          true,
      isActive:    cached?.is_active   ?? false,
      entitlement: cached?.entitlement ?? null,
      productId:   cached?.product_id  ?? null,
      store:        cached?.store       ?? null,
      expiresAt:   cached?.expires_at  ?? null,
    })
  }
}
