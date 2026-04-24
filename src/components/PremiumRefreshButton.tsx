'use client'

/**
 * PremiumRefreshButton — Client Component.
 *
 * Calls GET /api/premium/status (which hits RevenueCat and upserts the DB),
 * then calls router.refresh() so Next.js re-renders the dashboard Server
 * Components with the latest entitlement data — no page reload needed.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  label?: string
}

export default function PremiumRefreshButton({
  label = 'Refresh subscription',
}: Props) {
  const router  = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleRefresh() {
    setState('loading')
    try {
      const res = await fetch('/api/premium/status')
      if (!res.ok) throw new Error(`Status ${res.status}`)
      setState('done')
      // Re-run all server components on this page
      router.refresh()
      setTimeout(() => setState('idle'), 3000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 4000)
    }
  }

  const isLoading = state === 'loading'

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isLoading}
      className="inline-flex items-center gap-2 text-xs font-medium text-[#4A7A8A] hover:text-[#3DD6B0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Check subscription status with RevenueCat"
    >
      {/* Spin icon when loading */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={isLoading ? 'animate-spin' : ''}
      >
        <path
          d="M21 12a9 9 0 1 1-6.219-8.56"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {state === 'loading' && 'Checking…'}
      {state === 'done'    && 'Updated'}
      {state === 'error'   && 'Could not reach RevenueCat'}
      {state === 'idle'    && label}
    </button>
  )
}
