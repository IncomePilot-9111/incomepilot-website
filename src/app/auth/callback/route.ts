import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_AUTH_REDIRECT_PATH, sanitizeInternalRedirectPath } from '@/lib/auth-helpers'
import { createRouteHandlerClient } from '@/lib/supabase/server'

const CALLBACK_ERROR_PATH = '/auth/status?type=error'
const CALLBACK_INVALID_PATH = '/auth/status?type=invalid-link'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')?.trim()
  const nextPath = sanitizeInternalRedirectPath(
    requestUrl.searchParams.get('next'),
    DEFAULT_AUTH_REDIRECT_PATH,
  )

  if (!code) {
    return NextResponse.redirect(new URL(CALLBACK_INVALID_PATH, requestUrl))
  }

  const response = NextResponse.redirect(new URL(nextPath, requestUrl))
  const supabase = createRouteHandlerClient(request, response)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(CALLBACK_ERROR_PATH, requestUrl))
  }

  return response
}
