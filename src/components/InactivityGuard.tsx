'use client'

/**
 * InactivityGuard -- Client Component, mounted once in the root layout.
 *
 * Signs out the authenticated user and redirects to /signin?reason=inactive
 * after TIMEOUT_MS of no user activity, measured as wall-clock time since the
 * last activity event -- regardless of tab switching.
 *
 * Design:
 *   - Tracks last-activity as an absolute timestamp (lastActivityRef).
 *   - Activity events update the timestamp and reschedule the timer to fire
 *     at lastActivity + TIMEOUT_MS from now.
 *   - visibilitychange -> HIDDEN: timer keeps running uninterrupted.
 *     Switching tabs does NOT reset the 15-minute countdown.
 *   - visibilitychange -> VISIBLE: check elapsed time. If >= TIMEOUT_MS,
 *     fire logout immediately (user was away long enough). If not, reschedule
 *     for the remaining time (setTimeout may have been throttled by the browser
 *     while the tab was hidden).
 *   - On timeout: check for an active Supabase session first. If none, do
 *     nothing -- avoids redirecting unauthenticated visitors on public pages.
 *
 * Mounted in root layout so it runs across all pages without remounting on
 * navigation. A single persistent instance means the countdown is never
 * accidentally reset by a route change.
 */

import { useEffect, useRef } from 'react'
import { useRouter }         from 'next/navigation'
import { createClient }      from '@/lib/supabase/client'

/** 15 minutes in milliseconds */
const TIMEOUT_MS = 15 * 60 * 1000

/** DOM events that count as user activity */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
]

export default function InactivityGuard() {
  const router           = useRouter()
  const timerRef         = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef  = useRef<number>(Date.now())
  const isMounted        = useRef(true)

  useEffect(() => {
    isMounted.current = true

    /* ── Schedule the next timeout check ──────────────────────────────── */
    function scheduleCheck() {
      if (timerRef.current) clearTimeout(timerRef.current)
      const remaining = lastActivityRef.current + TIMEOUT_MS - Date.now()
      timerRef.current = setTimeout(() => { void handleTimeout() }, Math.max(0, remaining))
    }

    /* ── Record user activity and reschedule ───────────────────────────── */
    function recordActivity() {
      lastActivityRef.current = Date.now()
      scheduleCheck()
    }

    /* ── Fire when the timer expires ───────────────────────────────────── */
    async function handleTimeout() {
      if (!isMounted.current) return

      try {
        const supabase = createClient()
        // Only sign out if there is actually an active session.
        // getSession() is a local read -- no server round-trip.
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return            // unauthenticated user, nothing to do
        await supabase.auth.signOut()
      } catch {
        // Sign-out failure is non-fatal -- redirect regardless so the user
        // sees the inactivity message and is prompted to re-authenticate.
      }

      if (isMounted.current) {
        router.push('/signin?reason=inactive')
      }
    }

    /* ── Tab visibility changes ────────────────────────────────────────── */
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        // Tab returned. Check whether the idle window already expired while
        // the user was away -- if so, log them out immediately.
        if (Date.now() - lastActivityRef.current >= TIMEOUT_MS) {
          void handleTimeout()
        } else {
          // Not timed out yet. Reschedule with the correct remaining time
          // because the browser may have throttled the setTimeout while the
          // tab was hidden.
          scheduleCheck()
        }
      }
      // HIDDEN: do nothing -- the timer keeps counting.
      // Switching tabs does NOT restart the 15-minute window.
    }

    // Register all activity listeners
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, recordActivity, { passive: true }),
    )
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Start the initial timer
    scheduleCheck()

    return () => {
      isMounted.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, recordActivity),
      )
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null   // purely behavioural -- renders nothing
}
