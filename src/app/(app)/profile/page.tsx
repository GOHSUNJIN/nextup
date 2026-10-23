export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { signOut } from '@/app/actions/auth'

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
  const role = (profile?.role ?? 'player') as 'player' | 'co_admin' | 'admin'
  const isStaff = role === 'admin' || role === 'co_admin'

  const roleLabel = role === 'co_admin' ? 'Co-admin' : role.charAt(0).toUpperCase() + role.slice(1)

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="font-heading font-extrabold italic text-3xl uppercase">PROFILE</h1>

      {/* Hero card */}
      <div className="relative bg-black rounded-[18px] overflow-hidden px-5 py-5">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow rounded-full opacity-15" />
        <div className="absolute -top-2 -right-2 w-16 h-16 bg-yellow rounded-full opacity-20" />
        <div className="relative flex items-center gap-4">
          <PlayerAvatar name={name} role={role} avatarUrl={profile?.avatar_url} size={64} />
          <div className="min-w-0">
            <p className="font-heading font-extrabold italic text-2xl text-white uppercase leading-tight truncate">{name}</p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold mt-1.5 border-2 border-black ${
                isStaff ? 'bg-brand text-white' : 'bg-yellow text-black'
              }`}
            >
              {roleLabel.toUpperCase()}
            </span>
            {(profile?.email ?? user.email) && (
              <p className="text-[#BDB9AF] text-xs mt-1.5 truncate">{profile?.email ?? user.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden divide-y-2 divide-black">
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
          label="Email"
          value={profile?.email ?? user.email ?? '—'}
        />
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.95 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.88 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
          label="Phone"
          value={profile?.phone ?? '—'}
        />
        <InfoRow
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>}
          label="Gender"
          value={profile?.gender ? (profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)) : '—'}
        />
        {profile?.skill_tier && (
          <InfoRow
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
            label="Skill tier"
            value={profile.skill_tier}
          />
        )}
        {profile?.dupr_rating && (
          <InfoRow
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 2"/></svg>}
            label="DUPR rating"
            value={String(profile.dupr_rating)}
          />
        )}
      </div>

      {/* Account links */}
      <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden divide-y-2 divide-black">
        <ActionLink
          href="/profile/edit"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
          label="Edit profile"
        />
        <ActionLink
          href="/profile/settings"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
          label="Preferences & notifications"
        />
        <ActionLink
          href="/profile/faq"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Help & FAQ"
        />
      </div>

      {/* Sign out */}
      <form action={signOut}>
        <button
          type="submit"
          className="w-full h-[52px] border-2 border-black rounded-[14px] bg-white text-black font-heading font-extrabold italic text-xl uppercase shadow-[4px_4px_0_#111] hover:bg-muted transition-colors"
        >
          SIGN OUT
        </button>
      </form>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="flex items-center gap-2.5 text-body shrink-0">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-semibold text-black truncate text-right">{value}</span>
    </div>
  )
}

function ActionLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3.5 hover:bg-muted transition-colors gap-3">
      <div className="flex items-center gap-2.5">
        <span className="text-body">{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-body shrink-0">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  )
}
