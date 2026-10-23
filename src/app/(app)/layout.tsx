export const dynamic = 'force-dynamic'


import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let queuePosition: number | null = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('name, role, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data

    // Get queue position in the live session if waiting
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('status', 'live')
      .maybeSingle()

    if (session) {
      const { data: entry } = await supabase
        .from('queue_entries')
        .select('queue_position')
        .eq('session_id', session.id)
        .eq('player_id', user.id)
        .in('status', ['waiting', 'assigned', 'standby'])
        .maybeSingle()

      if (entry) {
        // Count entries ahead of this one to get display position
        const { count } = await supabase
          .from('queue_entries')
          .select('id', { count: 'exact', head: true })
          .eq('session_id', session.id)
          .in('status', ['waiting', 'assigned', 'standby'])
          .lt('queue_position', entry.queue_position)
        queuePosition = (count ?? 0) + 1
      }
    }
  }

  const role = (profile?.role ?? 'guest') as 'player' | 'co_admin' | 'admin' | 'guest'

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <Header
        name={profile?.name ?? (user ? user.email?.split('@')[0] : 'Guest')}
        role={user ? role : 'guest'}
        avatarUrl={profile?.avatar_url}
      />
      <main className="flex-1 overflow-y-auto px-4 pt-2.5 pb-6 flex flex-col gap-3">
        {children}
      </main>
      <BottomNav
        isAdmin={role === 'admin'}
        isCoadmin={role === 'co_admin'}
        queuePosition={queuePosition}
      />
    </div>
  )
}
