'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Phone number → internal email identity (no real emails sent)
function phoneToEmail(phone: string): string {
  return phone.replace(/\D/g, '') + '@nextup.app'
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const phone = (formData.get('phone') as string).trim()
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const gender = formData.get('gender') as 'male' | 'female'
  const pdpa = formData.get('pdpa') === 'on'

  if (!phone) return { error: 'Phone number is required.' }
  if (!pdpa) return { error: 'You must accept the privacy policy to create an account.' }

  const email = phoneToEmail(phone)

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone, gender } },
  })

  if (error) return { error: error.message }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles').upsert({
      id: user.id,
      name,
      phone,
      gender: gender as 'male' | 'female',
      pdpa_consent_at: new Date().toISOString(),
    }, { onConflict: 'id' })
  }

  redirect('/courts')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const phone = (formData.get('phone') as string).trim()
  const password = formData.get('password') as string
  const email = phoneToEmail(phone)

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'Incorrect phone number or password.' }

  const next = formData.get('next') as string || '/courts'
  redirect(next)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/courts')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const name = (formData.get('name') as string).trim()
  const phone = (formData.get('phone') as string).trim() || null
  const gender = (formData.get('gender') as string) || undefined
  const rawAvatar = (formData.get('avatar_url') as string).trim()

  if (!name) return { error: 'Name is required.' }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const avatarUrl = rawAvatar && rawAvatar.startsWith(supabaseUrl) ? rawAvatar : (rawAvatar === '' ? '' : undefined)

  const updateData: Record<string, unknown> = { id: user.id, name, phone }
  if (gender) updateData.gender = gender
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl || null

  const admin = createAdminClient()
  const { error } = await admin.from('profiles').upsert(updateData, { onConflict: 'id' })
  if (error) {
    if (error.code === '23505') return { error: 'That phone number is already linked to another account.' }
    return { error: error.message }
  }

  redirect('/profile')
}

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update({
    push_enabled: formData.get('push_enabled') === 'on',
    email_enabled: formData.get('email_enabled') === 'on',
    next_ping_enabled: formData.get('next_ping_enabled') === 'on',
    no_strong_courts: formData.get('no_strong_courts') === 'on',
    women_courts_only: formData.get('women_courts_only') === 'on',
  }).eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile/settings')
  return { success: true }
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  await supabase.from('profiles').update({
    name: 'Former player',
    phone: null,
    email: null,
    avatar_url: null,
    deleted_at: new Date().toISOString(),
  }).eq('id', user.id)

  await supabase.auth.signOut()
  redirect('/courts')
}
