import { describe, it, expect } from 'vitest'
import { mapRevenueCatSubscriber } from '../revenuecat'
import type {
  RevenueCatEntitlementInfo,
  RevenueCatSubscriber,
} from '../revenuecat'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAST   = '2020-01-01T00:00:00Z'
const FUTURE = '2099-12-31T00:00:00Z'
const NOW    = new Date('2025-06-01T12:00:00Z').getTime()

function makeSubscriber(
  overrides: Partial<RevenueCatEntitlementInfo> | null = {},
  entitlementName = 'IncomePilot Pro',
): RevenueCatSubscriber {
  const base: RevenueCatSubscriber = {
    entitlements:      {},
    subscriptions:     {},
    non_subscriptions: {},
    first_seen:        '2024-01-01T00:00:00Z',
    last_seen:         '2025-06-01T00:00:00Z',
    original_app_user_id: 'test-user-uuid',
  }
  if (overrides !== null) {
    base.entitlements[entitlementName] = {
      expires_date:               null,
      grace_period_expires_date:  null,
      product_identifier:         'annual_pro',
      purchase_date:              '2025-01-01T00:00:00Z',
      store:                      'app_store',
      ...overrides,
    }
  }
  return base
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('mapRevenueCatSubscriber', () => {

  describe('when no entitlement exists', () => {
    it('returns is_active=false with null product/store/expires', () => {
      const result = mapRevenueCatSubscriber(makeSubscriber(null), NOW)
      expect(result.is_active).toBe(false)
      expect(result.entitlement).toBeNull()
      expect(result.product_id).toBeNull()
      expect(result.store).toBeNull()
      expect(result.expires_at).toBeNull()
    })
  })

  describe('when entitlement has null expires_date (lifetime)', () => {
    it('returns is_active=true', () => {
      const result = mapRevenueCatSubscriber(
        makeSubscriber({ expires_date: null }),
        NOW,
      )
      expect(result.is_active).toBe(true)
      expect(result.entitlement).toBe('IncomePilot Pro')
    })

    it('maps product_id and store correctly', () => {
      const result = mapRevenueCatSubscriber(
        makeSubscriber({ expires_date: null, product_identifier: 'lifetime_pro', store: 'play_store' }),
        NOW,
      )
      expect(result.product_id).toBe('lifetime_pro')
      expect(result.store).toBe('play_store')
      expect(result.expires_at).toBeNull()
    })
  })

  describe('when entitlement expires in the future', () => {
    it('returns is_active=true', () => {
      const result = mapRevenueCatSubscriber(
        makeSubscriber({ expires_date: FUTURE }),
        NOW,
      )
      expect(result.is_active).toBe(true)
      expect(result.expires_at).toBe(FUTURE)
    })
  })

  describe('when entitlement is expired', () => {
    it('returns is_active=false but keeps the latest entitlement metadata', () => {
      const result = mapRevenueCatSubscriber(
        makeSubscriber({ expires_date: PAST }),
        NOW,
      )
      expect(result.is_active).toBe(false)
      expect(result.entitlement).toBe('IncomePilot Pro')
      expect(result.product_id).toBe('annual_pro')
      expect(result.store).toBe('app_store')
      expect(result.expires_at).toBe(PAST)
    })
  })

  describe('dynamic entitlement detection', () => {
    it('detects the active entitlement key without hardcoding "pro"', () => {
      const sub = makeSubscriber(null)
      sub.entitlements['IncomePilot Pro'] = {
        expires_date:              FUTURE,
        grace_period_expires_date: null,
        product_identifier:        'premium_monthly',
        purchase_date:             '2025-01-01T00:00:00Z',
        store:                     'stripe',
      }
      const result = mapRevenueCatSubscriber(sub, NOW)
      expect(result.is_active).toBe(true)
      expect(result.entitlement).toBe('IncomePilot Pro')
      expect(result.product_id).toBe('premium_monthly')
      expect(result.store).toBe('stripe')
    })

    it('prefers the active entitlement when multiple entitlement keys exist', () => {
      const sub = makeSubscriber({ expires_date: PAST }, 'legacy')
      sub.entitlements['IncomePilot Pro'] = {
        expires_date:              FUTURE,
        grace_period_expires_date: null,
        product_identifier:        'premium_monthly',
        purchase_date:             '2025-01-01T00:00:00Z',
        store:                     'app_store',
      }

      const result = mapRevenueCatSubscriber(sub, NOW)
      expect(result.is_active).toBe(true)
      expect(result.entitlement).toBe('IncomePilot Pro')
      expect(result.product_id).toBe('premium_monthly')
    })
  })

  describe('appUserId is master_account_uuid, not auth.users.id', () => {
    // The mapper receives the subscriber object that RevenueCat returns for
    // a given appUserId. The caller (route handler) is responsible for
    // resolving profiles.master_account_uuid before calling fetchRevenueCatSubscriber.
    // The mapper itself is identity-agnostic — this test documents that contract.
    it('produces correct output regardless of which UUID was used to fetch', () => {
      const masterUuid = 'a1b2c3d4-0000-0000-0000-000000000000'
      const sub = makeSubscriber({ expires_date: FUTURE })
      sub.original_app_user_id = masterUuid
      const result = mapRevenueCatSubscriber(sub, NOW)
      expect(result.is_active).toBe(true)
      expect(result.entitlement).toBe('IncomePilot Pro')
    })
  })

  describe('grace period: entitlement expired but in grace', () => {
    it('still returns is_active=false (grace period is RevenueCat-side logic)', () => {
      // expires_date is in the past — our mapper uses expires_date, not grace
      const result = mapRevenueCatSubscriber(
        makeSubscriber({ expires_date: PAST, grace_period_expires_date: FUTURE }),
        NOW,
      )
      // Our mapper doesn't extend based on grace_period_expires_date
      // because RevenueCat resolves this server-side and reflects it in
      // entitlements[key] presence/absence. If the entitlement key is
      // present the subscriber is still entitled. expires_date here is
      // the subscription expiry, not entitlement expiry.
      // The test documents current behaviour — adjust if RC docs change.
      expect(result.is_active).toBe(false)
    })
  })
})
