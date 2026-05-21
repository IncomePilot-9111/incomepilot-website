import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Auth + Security middleware -- runs on every non-static request.
 *
 * Responsibilities:
 *  1. Refresh the Supabase session cookie so it never goes stale between
 *     server renders (critical for SSR auth with @supabase/ssr).
 *  2. Protect /dashboard -- redirect unauthenticated visitors to /signin.
 *  3. Generate a per-request nonce and set a strict Content-Security-Policy
 *     header dynamically (replaces the static CSP in vercel.json).
 *
 * CSP notes:
 *   - 'nonce-{nonce}' is used so trusted inline scripts can opt-in.
 *   - 'strict-dynamic' propagates trust to scripts loaded by nonce-trusted
 *     scripts (covers Next.js's runtime chunk loading).
 *   - 'unsafe-inline' is retained as a fallback ONLY for older browsers that
 *     do not support nonces/strict-dynamic; modern browsers with nonce support
 *     will ignore 'unsafe-inline' when a nonce is present.
 *   - style-src retains 'unsafe-inline' because Tailwind CSS injects styles at
 *     runtime; hashing every dynamic class string is not practical.
 *   - The nonce is forwarded as the 'x-nonce' request header so server
 *     components can read it via headers() and pass it to <Script nonce>.
 *
 * IMPORTANT: always return supabaseResponse (or a redirect), never a bare
 * NextResponse.next(), otherwise the refreshed Set-Cookie headers are lost.
 */

function buildCSP(nonce: string): string {
  const directives = [
    `default-src 'self'`,
    // nonce-based trust + strict-dynamic for dynamically loaded chunks.
    // unsafe-inline is a fallback for browsers without nonce support.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'`,
    // Tailwind requires unsafe-inline; no practical alternative without
    // build-time CSS extraction which is outside this project's scope.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    // Supabase API + Vercel Analytics endpoints
    `connect-src 'self' https://*.supabase.co https://va.vercel-analytics.com https://vitals.vercel-analytics.com https://*.vercel-analytics.com`,
    `font-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ]
  return directives.join('; ')
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ── Generate per-request nonce for CSP ────────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp   = buildCSP(nonce)

  // Build a mutated request so downstream server components can read the nonce
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // ── Set CSP on the response so the browser enforces it ────────────────────
  supabaseResponse.headers.set('Content-Security-Policy', csp)

  // ── Skip gracefully if Supabase is not configured ─────────────────────────
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  // ── Refresh the Supabase session cookie ───────────────────────────────────
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Write refreshed cookies back onto the request for downstream Server Components
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        // Rebuild the response so the Set-Cookie headers reach the browser
        supabaseResponse = NextResponse.next({
          request: { headers: requestHeaders },
        })
        // Re-apply CSP after response rebuild
        supabaseResponse.headers.set('Content-Security-Policy', csp)
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  // getUser() validates the JWT with the Supabase server -- more secure than
  // getSession() which only reads the cookie without server validation.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Protect /dashboard -- redirect to /signin if not authenticated ─────────
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/signin'
    const redirectResponse = NextResponse.redirect(redirectUrl)
    redirectResponse.headers.set('Content-Security-Policy', csp)
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match every path except Next.js internals and static assets.
     * This ensures the session is refreshed on every page navigation
     * and the CSP nonce is applied to every HTML response.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
