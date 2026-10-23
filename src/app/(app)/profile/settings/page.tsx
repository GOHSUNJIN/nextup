export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SettingsForm } from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile/settings')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('push_enabled, email_enabled, next_ping_enabled, no_strong_courts, women_courts_only, gender')
    .eq('id', user.id)
    .single()

  const prefs = {
    push_enabled: profile?.push_enabled ?? true,
    email_enabled: profile?.email_enabled ?? true,
    next_ping_enabled: profile?.next_ping_enabled ?? true,
    no_strong_courts: profile?.no_strong_courts ?? false,
    women_courts_only: profile?.women_courts_only ?? false,
    gender: profile?.gender ?? null,
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center bg-white shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">SETTINGS</h1>
      </div>

      <SettingsForm prefs={prefs} />
    </div>
  )
}
