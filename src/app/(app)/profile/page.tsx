export const dynamic = 'force-dynamic'


import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { signOut } from '@/app/actions/auth'
import { BigActionButton } from '@/components/ui/BigActionButton'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('name, email, phone, gender, role, skill_tier, avatar_url, dupr_rating')
    .eq('id', user.id)
    .single()

  const name = profile?.name ?? 'Player'
  const role = profile?.role ?? 'player'

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading font-extrabold italic text-3xl uppercase">PROFILE</h1>

      {/* Avatar + name card */}
      <div className="bg-dark-card rounded-[18px] p-5 flex items-center gap-4">
        <PlayerAvatar name={name} role={role as 'player' | 'co_admin' | 'admin'} avatarUrl={profile?.avatar_url} size={56} />
        <div>
          <p className="font-bold text-white text-lg leading-tight">{name}</p>
          <p className="text-dark-muted text-xs capitalize mt-0.5">{role.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white border-2 border-black rounded-[18px] divide-y-2 divide-black overflow-hidden">
        <Row label="Email" value={profile?.email ?? user.email ?? '—'} />
        <Row label="Phone" value={profile?.phone ?? '—'} />
        <Row label="Gender" value={profile?.gender ? (profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)) : '—'} />
        <Row label="Skill tier" value={profile?.skill_tier ?? '—'} />
        {profile?.dupr_rating && <Row label="DUPR rating" value={String(profile.dupr_rating)} />}
      </div>

      {/* Account links */}
      <div className="bg-white border-2 border-black rounded-[18px] divide-y-2 divide-black overflow-hidden">
        <LinkRow href="/profile/edit" label="Edit profile" />
        <LinkRow href="/profile/settings" label="Settings" />
        <LinkRow href="/profile/faq" label="Help & FAQ" />
      </div>

      {/* Sign out */}
      <form action={signOut}>
        <BigActionButton type="submit" variant="white" size="lg">
          SIGN OUT
        </BigActionButton>
      </form>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-body">{label}</span>
      <span className="text-sm font-semibold text-black">{value}</span>
    </div>
  )
}

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3.5 hover:bg-muted transition-colors">
      <span className="text-sm font-semibold">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  )
}
