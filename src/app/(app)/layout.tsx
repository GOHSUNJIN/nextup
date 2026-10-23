export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile: { name: string; role: string; avatar_url: string | null } | null = null
  let queuePosition: number | null = null

  if (user) {
    // Admin client bypasses RLS — profile always loads even if SELECT policy is missing
    const [profileResult, sessionResult] = await Promise.all([
      admin.from('profiles').select('name, role, avatar_url').eq('id', user.id).single(),
      admin.from('sessions').select('id').eq('status', 'live').maybeSingle(),
    ])

    profile = profileResult.data

    // If profile row never got created, seed a minimal one
    if (!profile) {
      const fallbackName = (user.user_metadata?.name as string | undefined) ?? 'Player'
      await admin.from('profiles').upsert(
        { id: user.id, name: fallbackName },
        { onConflict: 'id' }
      )
      profile = { name: fallbackName, role: 'player', avatar_url: null }
    }

    const session = sessionResult.data
    if (session) {
      const { data: entry } = await admin
        .from('queue_entries')
        .select('queue_position')
        .eq('session_id', session.id)
        .eq('player_id', user.id)
        .in('status', ['waiting', 'assigned', 'standby'])
        .maybeSingle()

      if (entry) {
        const { count } = await admin
          .from('queue_entries')
          .select('id', { count: 'exact', head: true })
          .eq('session_id', session.id)
          .in('status', ['waiting', 'assigned', 'standby'])
          .lt('queue_position', entry.queue_position)
        queuePosition = (count ?? 0) + 1
      }
    }
  }

  const role = (profile?.role ?? 'player') as 'player' | 'co_admin' | 'admin' | 'guest'
  const displayRole: 'player' | 'co_admin' | 'admin' | 'guest' = user ? role : 'guest'

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <Header
        name={profile?.name ?? (user ? ((user.user_metadata?.name as string | undefined) ?? 'Player') : 'Guest')}
        role={displayRole}
        avatarUrl={profile?.avatar_url}
      />
      <main className="flex-1 overflow-y-auto px-4 pt-2.5 pb-6 flex flex-col gap-3">
        {children}
      </main>
      <BottomNav
        isAdmin={displayRole === 'admin'}
        isCoadmin={displayRole === 'co_admin'}
        queuePosition={queuePosition}
      />
    </div>
  )
}
