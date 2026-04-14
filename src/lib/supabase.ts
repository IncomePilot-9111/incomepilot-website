import { createClient } from '@supabase/supabase-js'

/**
 * Returns a Supabase browser client.
 *
 * Env vars required (set in .env.local or Vercel dashboard):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * These are safe to expose to the browser — the anon key is intentionally
 * public and protected by Row-Level Security policies on your Supabase project.
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      '[IncomePilot] Supabase env vars not set. ' +
        'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.',
    )
  }

  return createClient(url, key, {
    auth: {
      // Store session in localStorage so it persists across tabs
      persistSession: true,
      // Auto-refresh access tokens before they expire
      autoRefreshToken: true,
      // Detect OAuth/magic-link redirects automatically
      detectSessionInUrl: true,
    },
  })
}

/* ─── Deep-link helpers ──────────────────────────────────────────────────── */

/**
 * The custom-scheme URI that opens the IncomePilot app.
 *
 * Flutter registers this via intent-filter (Android) and Info.plist (iOS).
 * Update this if the scheme ever changes.
 */
export const APP_SCHEME = 'incomepilot'

/**
 * Build the deep link that opens the app after a successful verification.
 *
 * On success the app should resume from the auth confirmation screen
 * and sign the user in with the session tokens that were set by
 * supabase.auth.verifyOtp() above.
 *
 * The `?verified=1` query param lets the app know the link came from
 * a browser confirmation (so it can skip re-asking for the code).
 */
export function buildAuthVerifiedDeepLink(): string {
  return `${APP_SCHEME}://auth/verified?verified=1`
}

/**
 * Attempt to open the app via deep link.
 *
 * Strategy:
 *  1. Set window.location.href to the custom-scheme URI.
 *  2. After `timeoutMs`, if the page is still visible, resolve false —
 *     the app either wasn't installed or the OS ignored the scheme.
 *
 * Note: this is best-effort.  iOS/Android silently swallow unhandled
 * custom-scheme opens, so we can't detect success directly.
 */
export function tryOpenApp(deepLink: string, timeoutMs = 2200): Promise<boolean> {
  return new Promise((resolve) => {
    // Don't even try on non-browser environments (SSR)
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    let settled = false

    // Listen for the page becoming hidden — a strong signal the app opened
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !settled) {
        settled = true
        cleanup()
        resolve(true)
      }
    }

    const onBlur = () => {
      if (!settled) {
        settled = true
        cleanup()
        resolve(true)
      }
    }

    const cleanup = () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onBlur)
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onBlur)

    // Fire the deep link
    window.location.href = deepLink

    // Fallback — assume app didn't open after timeout
    setTimeout(() => {
      if (!settled) {
        settled = true
        cleanup()
        resolve(false)
      }
    }, timeoutMs)
  })
}
