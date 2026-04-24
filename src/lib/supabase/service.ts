/**
 * Supabase service-role client.
 *
 * SERVER-ONLY — this bypasses Row Level Security and must NEVER be
 * imported by client components or bundled into the browser.
 *
 * Usage: privileged writes (upsert premium_entitlements from webhook /
 * API routes where we trust our own server code, not the end user).
 */
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      '[Valkoda] SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
        'Add it to your .env.local or Vercel project settings (non-NEXT_PUBLIC_).',
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      // Service clients do not manage user sessions — disable persistence
      autoRefreshToken: false,
      persistSession:   false,
    },
  })
}
