import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/signin')
    }

    return (
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1 bg-[#070F15] px-6 py-16 text-[#E8F5F2]">
          <div className="mx-auto max-w-3xl space-y-3">
            <h1 className="text-3xl font-bold">Signed in successfully</h1>
            <p className="text-base text-[#8CB4C0]">{user.email ?? 'Email unavailable'}</p>
            <p className="text-base text-[#8CB4C0]">Dashboard placeholder</p>
          </div>
        </main>
      </div>
    )
  } catch {
    // Supabase not configured or any auth error — redirect to sign in
    redirect('/signin')
  }
}
