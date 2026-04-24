/**
 * GET /api/premium/status
 *
 * Server-only endpoint. Verifies the signed-in user's session, calls the
 * RevenueCat REST API with the Supabase user UUID as the appUserID, upserts
 * the result into public.premium_entitlements, then returns the live status.
 *
 * Falls back to the cached DB row if RevenueCat is unreachable, so the
 * dashboard never hard-fails on a third-party outage.
 *
 * Authentication: Supabase session cookie (set by /auth/callback).
 * No secret keys are returned in the response.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchRevenueCatSubscriber, mapRevenueCatSubscriber } from '@/lib/revenuecat'

export const dynamic = 'force-dynamic'

export async function GET() {
  // ── 1. Verify the caller's Supabase session ────────────────────────────
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

  const userId = user.id   // Supabase UUID == RevenueCat appUserID
  const service = createServiceClient()

  // ── 2. Try live RevenueCat fetch ───────────────────────────────────────
  try {
    const subscriber = await fetchRevenueCatSubscriber(userId)
    const mapped     = mapRevenueCatSubscriber(subscriber)

    // ── 3. Upsert into premium_entitlements ──────────────────────────────
    const now = new Date().toISOString()
    const { error: upsertError } = await service
      .from('premium_entitlements')
      .upsert(
        {
          user_id:                  userId,
          revenuecat_app_user_id:   userId,
          is_active:                mapped.is_active,
          entitlement:              mapped.entitlement,
          product_id:               mapped.product_id,
          store:                    mapped.store,
          expires_at:               mapped.expires_at,
          last_checked_at:          now,
          updated_at:               now,
        },
        { onConflict: 'user_id' },
      )

    if (upsertError) {
      console.error('[/api/premium/status] upsert error:', upsertError.message)
      // Non-fatal — still return the live RC data
    }

    return NextResponse.json({
      is_active:  mapped.is_active,
      entitlement: mapped.entitlement,
      product_id: mapped.product_id,
      store:      mapped.store,
      expires_at: mapped.expires_at,
      source:     'revenuecat',
    })
  } catch (rcError) {
    // ── 4. RevenueCat unavailable — fall back to DB cache ─────────────────
    console.warn('[/api/premium/status] RevenueCat unreachable, using cache:', rcError)

    const { data: cached } = await service
      .from('premium_entitlements')
      .select('is_active, entitlement, product_id, store, expires_at')
      .eq('user_id', userId)
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
