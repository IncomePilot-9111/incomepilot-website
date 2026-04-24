/**
 * RevenueCat REST API client and subscriber mapper.
 *
 * SERVER-ONLY — never import this in client components.
 * All secrets are read from process.env at call-time so they are never
 * bundled into the browser payload.
 *
 * RevenueCat REST API v1 reference:
 *   https://www.revenuecat.com/reference/subscribers
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RevenueCatEntitlementInfo {
  /** ISO-8601 or null for lifetime entitlements */
  expires_date: string | null
  grace_period_expires_date: string | null
  product_identifier: string
  purchase_date: string
  /** 'app_store' | 'play_store' | 'stripe' | 'amazon' | 'promotional' | … */
  store: string
}

export interface RevenueCatSubscriber {
  entitlements: Record<string, RevenueCatEntitlementInfo>
  subscriptions: Record<string, unknown>
  non_subscriptions: Record<string, unknown[]>
  first_seen: string
  last_seen: string
  original_app_user_id: string
}

export interface RevenueCatGetSubscriberResponse {
  subscriber: RevenueCatSubscriber
  request_date: string
  request_date_ms: number
}

/**
 * The values extracted from RevenueCat ready to upsert into
 * public.premium_entitlements (excludes user_id / timestamps which
 * the caller controls).
 */
export interface PremiumEntitlementValues {
  is_active: boolean
  entitlement: string | null
  product_id: string | null
  store: string | null
  expires_at: string | null
}

// ─── Mapper (pure — no I/O, fully unit-testable) ─────────────────────────────

/**
 * Map a RevenueCat subscriber object to the values required for the
 * premium_entitlements row.
 *
 * Active rules:
 *   - active entitlement is detected dynamically from subscriber.entitlements
 *   - expires_date === null  → lifetime (always active)
 *   - expires_date > now()   → active subscription
 *   - otherwise              → expired / inactive
 *
 * @param subscriber  The `subscriber` object from the RevenueCat API response.
 * @param now  Injectable timestamp for deterministic testing. Defaults to Date.now().
 */
export function mapRevenueCatSubscriber(
  subscriber: RevenueCatSubscriber,
  now: number = Date.now(),
): PremiumEntitlementValues {
  const entitlementEntries = Object.entries(subscriber.entitlements)

  const activeEntry = entitlementEntries.find(([, entitlement]) => (
    entitlement.expires_date === null ||
    new Date(entitlement.expires_date).getTime() > now
  ))

  const fallbackEntry = entitlementEntries.reduce<
    [string, RevenueCatEntitlementInfo] | null
  >((latest, entry) => {
    const [, entitlement] = entry

    if (!latest) {
      return entry
    }

    const [, currentLatest] = latest
    const latestTime =
      currentLatest.expires_date === null
        ? Number.POSITIVE_INFINITY
        : new Date(currentLatest.expires_date).getTime()
    const entryTime =
      entitlement.expires_date === null
        ? Number.POSITIVE_INFINITY
        : new Date(entitlement.expires_date).getTime()

    return entryTime > latestTime ? entry : latest
  }, null)

  const selectedEntry = activeEntry ?? fallbackEntry

  if (!selectedEntry) {
    return {
      is_active: false,
      entitlement: null,
      product_id: null,
      store: null,
      expires_at: null,
    }
  }

  const [entitlementName, entitlement] = selectedEntry
  const isActive = activeEntry !== undefined

  return {
    is_active: isActive,
    entitlement: entitlementName,
    product_id: entitlement.product_identifier ?? null,
    store: entitlement.store ?? null,
    expires_at: entitlement.expires_date ?? null,
  }
}

// ─── API client ───────────────────────────────────────────────────────────────

/**
 * Fetch a subscriber from the RevenueCat REST API.
 *
 * @param appUserId  The RevenueCat appUserID. On this platform that is
 *                   profiles.master_account_uuid — NOT auth.users.id.
 *                   The caller is responsible for resolving the correct UUID
 *                   before calling this function.
 *
 * @throws Error with a descriptive message on network or API failure.
 */
export async function fetchRevenueCatSubscriber(
  appUserId: string,
): Promise<RevenueCatSubscriber> {
  const secretKey = process.env.REVENUECAT_SECRET_API_KEY
  if (!secretKey) {
    throw new Error('[RevenueCat] REVENUECAT_SECRET_API_KEY env var is not set.')
  }

  const url = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    // Never cache — always reflect current subscription state
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `[RevenueCat] GET /subscribers/${appUserId} returned ${res.status}: ${body}`,
    )
  }

  const json = (await res.json()) as RevenueCatGetSubscriberResponse
  return json.subscriber
}
