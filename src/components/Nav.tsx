import NavClient from './NavClient'

/**
 * Nav — async Server Component.
 *
 * Tries to resolve the current user from Supabase so NavClient can show
 * the signed-in state. If Supabase is unavailable or env vars are not yet
 * configured (e.g. during a fresh Vercel deploy), the catch block returns
 * null and NavClient renders the unauthenticated state — no crash, no
 * server-side exception.
 */
export default async function Nav() {
  let userEmail: string | null = null

  try {
    // Dynamic import keeps the Supabase server client out of the module graph
    // until runtime, so a missing env var doesn't break the build.
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userEmail = user?.email ?? null
  } catch {
    // Supabase credentials not configured, service unavailable, or any
    // other auth error — silently treat as unauthenticated.
  }

  return <NavClient userEmail={userEmail} />
}
