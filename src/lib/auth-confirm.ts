import type { EmailOtpType } from '@supabase/supabase-js'

export type AuthConfirmParams =
  | {
      kind: 'otp'
      tokenHash: string
      otpType: EmailOtpType
      redirectTo: string | null
    }
  | {
      kind: 'code'
      code: string
      redirectTo: string | null
    }
  | {
      kind: 'invalid'
      heading: string
      detail: string
      canRetry: boolean
    }

export type AuthConfirmErrorState = {
  heading: string
  detail: string
  canRetry: boolean
}

const SUPPORTED_EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  'signup',
  'email',
  'email_change',
  'recovery',
  'magiclink',
  'invite',
])

export function resolveAuthConfirmParams(
  searchParams: URLSearchParams | ReadonlyURLSearchParamsLike,
): AuthConfirmParams {
  const code = readParam(searchParams, 'code')
  const tokenHash = readParam(searchParams, 'token_hash')
  const type = readParam(searchParams, 'type')
  const redirectTo = sanitizeRedirectTarget(readParam(searchParams, 'redirect_to'))
  const urlError = readParam(searchParams, 'error')
  const urlErrorDescription = readParam(searchParams, 'error_description')

  if (urlError) {
    return {
      kind: 'invalid',
      ...mapVerificationFailure(urlErrorDescription ?? urlError),
    }
  }

  if (code) {
    return {
      kind: 'code',
      code,
      redirectTo,
    }
  }

  if (!tokenHash || !type) {
    return {
      kind: 'invalid',
      heading: 'Verification link unavailable',
      detail:
        'This verification link is missing required information. Please return to IncomePilot and request a new verification email.',
      canRetry: true,
    }
  }

  if (!SUPPORTED_EMAIL_OTP_TYPES.has(type as EmailOtpType)) {
    return {
      kind: 'invalid',
      heading: 'Verification link unavailable',
      detail:
        'This verification link is no longer valid. Please return to IncomePilot and request a new verification email.',
      canRetry: true,
    }
  }

  return {
    kind: 'otp',
    tokenHash,
    otpType: type as EmailOtpType,
    redirectTo,
  }
}

export function mapVerificationFailure(raw: string): AuthConfirmErrorState {
  const lower = raw.toLowerCase()

  if (
    lower.includes('expired') ||
    lower.includes('already') ||
    lower.includes('used') ||
    lower.includes('invalid') ||
    lower.includes('not found') ||
    lower.includes('otp') ||
    lower.includes('token')
  ) {
    return {
      heading: 'Verification link unavailable',
      detail:
        'This verification link may have expired, already been used, or is no longer valid.\n\nPlease return to IncomePilot and request a new verification email.',
      canRetry: true,
    }
  }

  if (
    lower.includes('fetch') ||
    lower.includes('network') ||
    lower.includes('timed out') ||
    lower.includes('timeout') ||
    lower.includes('service unavailable') ||
    lower.includes('gateway') ||
    lower.includes('failed to send request')
  ) {
    return {
      heading: 'Service unavailable',
      detail: 'IncomePilot is having trouble connecting right now. Please try again in a moment.',
      canRetry: true,
    }
  }

  return {
    heading: 'Service unavailable',
    detail: 'IncomePilot is having trouble connecting right now. Please try again in a moment.',
    canRetry: true,
  }
}

export function defaultAuthCallbackDeepLink(): string {
  return 'incomepilot://auth/callback'
}

export function sanitizeRedirectTarget(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (/^(javascript|data):/i.test(trimmed)) return null
  return trimmed
}

function readParam(
  searchParams: URLSearchParams | ReadonlyURLSearchParamsLike,
  key: string,
): string | null {
  const value = searchParams.get(key)
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

type ReadonlyURLSearchParamsLike = {
  get(name: string): string | null
}
