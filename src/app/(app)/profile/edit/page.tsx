export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditProfileForm } from './EditProfileForm'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile/edit')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, phone, gender, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <EditProfileForm
      name={profile?.name ?? ''}
      phone={profile?.phone ?? ''}
      gender={profile?.gender ?? 'male'}
      avatarUrl={profile?.avatar_url ?? null}
      userId={user.id}
    />
  )
}
