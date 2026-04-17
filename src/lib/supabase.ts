import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

type BrowserClientOptions = {
  detectSessionInUrl?: boolean
}

/**
 * Returns a Supabase browser client.
 *
 * Env vars required (set in .env.local or Vercel dashboard):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *
 * These are safe to expose to the browser and protected by Row-Level Security
 * policies on your Supabase project.
 */
export function createBrowserClient(options: BrowserClientOptions = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      '[IncomePilot] Supabase env vars not set. ' +
        'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.',
    )
  }

  return createSupabaseBrowserClient(url, key, {
    auth: {
      // Store session in localStorage so it persists across tabs
      persistSession: true,
      // Auto-refresh access tokens before they expire
      autoRefreshToken: true,
      // Only enable URL-based session detection on flows that actually need it
      detectSessionInUrl: options.detectSessionInUrl ?? true,
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
 * Only values that start with the registered app scheme are accepted.
 * Any other value (http/https URLs, javascript: URIs, empty strings) is
 * silently rejected and replaced with the safe default callback route.
 * This prevents open-redirect and javascript: injection attacks via a
 * crafted `redirect_to` query parameter.
 */
export function buildAuthVerifiedDeepLink(redirectTo?: string | null): string {
  const trimmed = redirectTo?.trim()
  if (trimmed && trimmed.startsWith(`${APP_SCHEME}://`)) {
    return trimmed
  }
  return `${APP_SCHEME}://auth/callback`
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
