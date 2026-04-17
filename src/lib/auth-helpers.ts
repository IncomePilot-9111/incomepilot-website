const LOCALHOST_SITE_URL = 'http://localhost:3000'
export const DEFAULT_AUTH_REDIRECT_PATH = '/dashboard'

export function getSiteUrl(path: string) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const baseUrl =
    envUrl && envUrl.length > 0
      ? envUrl
      : typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : LOCALHOST_SITE_URL

  return new URL(path, baseUrl).toString()
}

export function sanitizeInternalRedirectPath(
  path: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT_PATH,
) {
  const trimmedPath = path?.trim()

  if (!trimmedPath || !trimmedPath.startsWith('/') || trimmedPath.startsWith('//')) {
    return fallback
  }

  if (trimmedPath.includes('\\')) {
    return fallback
  }

  try {
    const parsedPath = new URL(trimmedPath, LOCALHOST_SITE_URL)
    return `${parsedPath.pathname}${parsedPath.search}`
  } catch {
    return fallback
  }
}

export function normalizeAuthMessage(
  message: string,
  fallback = 'Unable to continue right now. Please try again.',
) {
  const cleanedMessage = message.replace(/^AuthApiError:\s*/i, '').trim()

  if (!cleanedMessage) {
    return fallback
  }

  if (/fetch failed|network|timeout|timed out/i.test(cleanedMessage)) {
    return fallback
  }

  return cleanedMessage
}
