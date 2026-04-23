import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Auth middleware - runs on every non-static request.
 *
 * Two responsibilities:
 *  1. Refresh the Supabase session cookie so it never goes stale between
 *     server renders (critical for SSR auth with @supabase/ssr).
 *  2. Protect /dashboard - redirect unauthenticated visitors to /signin.
 *
 * IMPORTANT: always return supabaseResponse (or a redirect), never a bare
 * NextResponse.next(), otherwise the refreshed Set-Cookie headers are lost.
 */
export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip gracefully if Supabase is not yet configured (local dev without .env.local)
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Write refreshed cookies back onto the request for downstream Server Components
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        // Rebuild the response so the Set-Cookie headers reach the browser
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  // getUser() validates the JWT with the Supabase server - more secure than
  // getSession() which only reads the cookie without server validation.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /dashboard - redirect to /signin if not authenticated
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/signin'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match every path except Next.js internals and static assets.
     * This ensures the session is refreshed on every page navigation.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
