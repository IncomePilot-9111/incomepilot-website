'use client'

/**
 * InactivityGuard -- Client Component.
 *
 * Signs out the authenticated user and redirects to /signin?reason=inactive
 * after TIMEOUT_MS of no activity.
 *
 * Activity events that reset the timer:
 *   mousemove, mousedown, keydown, touchstart, scroll,
 *   visibilitychange (when the page becomes visible again)
 *
 * Clean-up: all event listeners are removed on unmount to prevent memory
 * leaks. The timer reference is stored in a ref so interval/timeout IDs
 * do not cause re-renders.
 *
 * Usage: render inside any authenticated server component. Does nothing if
 * the component is unmounted (e.g. user navigates away or logs out).
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
  const router      = useRouter()
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted   = useRef(true)

  useEffect(() => {
    isMounted.current = true

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(handleTimeout, TIMEOUT_MS)
    }

    async function handleTimeout() {
      if (!isMounted.current) return
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
      } catch {
        // Sign-out failure is non-fatal -- redirect regardless so the user
        // sees the inactivity message and can re-authenticate.
      }
      if (isMounted.current) {
        router.push('/signin?reason=inactive')
      }
    }

    function handleVisibilityChange() {
      // When the user returns to the tab, treat it as activity
      if (document.visibilityState === 'visible') resetTimer()
    }

    // Register all activity events
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true }),
    )
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Start the initial timer
    resetTimer()

    return () => {
      isMounted.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      )
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // router is stable; intentionally empty dep array after it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Renders nothing -- purely behavioural
  return null
}
