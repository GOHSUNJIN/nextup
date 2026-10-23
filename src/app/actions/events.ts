'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleReminder(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: existing } = await supabase
    .from('session_reminders')
    .select('session_id')
    .eq('session_id', sessionId)
    .eq('player_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('session_reminders')
      .delete()
      .eq('session_id', sessionId)
      .eq('player_id', user.id)
  } else {
    await supabase
      .from('session_reminders')
      .insert({ session_id: sessionId, player_id: user.id })
  }

  revalidatePath('/events')
}
