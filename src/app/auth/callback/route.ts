import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { DEFAULT_AUTH_REDIRECT_PATH, sanitizeInternalRedirectPath } from '@/lib/auth-helpers'

const CALLBACK_ERROR_PATH   = '/auth/status?type=error'
const CALLBACK_INVALID_PATH = '/auth/status?type=invalid-link'

/**
 * Web auth callback — handles both PKCE and OTP confirmation flows.
 *
 * PKCE flow  (modern default):  ?code=XXX[&next=/dashboard]
 * OTP flow   (legacy / mobile):  ?token_hash=XXX&type=signup[&next=/dashboard]
 *
 * Uses cookies() from next/headers (not request.cookies) so that:
 *  - The PKCE code-verifier cookie written by the browser client during
 *    signUp() is always visible here, even after middleware rewrites.
 *  - Session cookies written by exchangeCodeForSession/verifyOtp are
 *    automatically included in whichever response this handler returns.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code      = searchParams.get('code')?.trim()      || null
  const tokenHash = searchParams.get('token_hash')?.trim() || null
  const otpType   = searchParams.get('type')?.trim()       as EmailOtpType | null
  const nextPath  = sanitizeInternalRedirectPath(
    searchParams.get('next'),
    DEFAULT_AUTH_REDIRECT_PATH,
  )

  // Must have a PKCE code OR a token_hash+type pair
  if (!code && !tokenHash) {
    return NextResponse.redirect(new URL(CALLBACK_INVALID_PATH, origin))
  }

  // ── Build the Supabase client using next/headers cookies ──────────────
  // This is the pattern recommended by Supabase for Next.js route handlers.
  // It ensures the PKCE verifier and session tokens are read/written through
  // the same cookie store that middleware and Server Components use.
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )

  // ── Exchange the code or verify the OTP ──────────────────────────────
  let authError: { message: string } | null = null

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error
  } else if (tokenHash && otpType) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType })
    authError = error
  } else {
    // token_hash present but type missing — unusable
    return NextResponse.redirect(new URL(CALLBACK_INVALID_PATH, origin))
  }

  if (authError) {
    console.error('[/auth/callback] auth exchange failed:', authError.message)
    return NextResponse.redirect(new URL(CALLBACK_ERROR_PATH, origin))
  }

  // ── Redirect to the intended destination ─────────────────────────────
  // Session cookies were written to cookieStore above; Next.js merges them
  // into this redirect response automatically.
  return NextResponse.redirect(new URL(nextPath, origin))
}
