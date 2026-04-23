import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client.
 * Throws early with a clear message if env vars are missing so the caller
 * can catch it and show a visible error instead of a silent failure.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      '[Valkoda] Supabase not configured. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
        'in your .env.local or Vercel project settings.',
    )
  }

  return createBrowserClient(url, key)
}
