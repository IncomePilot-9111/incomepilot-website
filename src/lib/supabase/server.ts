import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

type SupabaseCookie = {
  name: string
  value: string
  options: CookieOptions
}

function createServerSupabaseClient({
  getAll,
  setAll,
}: {
  getAll: () => { name: string; value: string }[]
  setAll: (cookiesToSet: SupabaseCookie[]) => void
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll,
        setAll(cookiesToSet) {
          setAll(cookiesToSet)
        },
      },
    },
  )
}

export async function createClient() {
  // Fail early with a clear message if env vars are missing, so callers
  // can catch this and degrade gracefully instead of getting a cryptic
  // "Invalid URL" from @supabase/ssr deep inside the call stack.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new Error(
      '[Valkoda] Supabase env vars not configured. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ' +
        'in your .env.local or Vercel project settings.',
    )
  }

  const cookieStore = await cookies()

  return createServerSupabaseClient({
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      } catch {
        // Server Components can read request cookies during render, but
        // they may not be able to write refreshed cookies in every path.
      }
    },
  })
}

export function createRouteHandlerClient(request: NextRequest, response: NextResponse) {
  return createServerSupabaseClient({
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
    },
  })
}
