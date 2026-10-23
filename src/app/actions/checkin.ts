'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function venueCheckIn(sessionId: string, code: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('validate_checkin_code', {
    p_session_id: sessionId,
    p_code: code.toUpperCase().trim(),
  })
  if (error) return { error: error.message }

  const result = data as { success: boolean; error?: string }
  if (!result.success) {
    if (result.error === 'invalid_or_expired_code')
      return { error: 'Invalid or expired code. Ask the admin for the current code.' }
    if (result.error === 'session_not_live')
      return { error: 'This session is not live yet.' }
    return { error: result.error ?? 'Check-in failed.' }
  }

  revalidatePath('/queue')
}

export async function playerCheckIn(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  await supabase
    .from('match_players')
    .update({ checked_in_at: new Date().toISOString() })
    .eq('match_id', matchId)
    .eq('player_id', user.id)

  const { data: players } = await supabase
    .from('match_players')
    .select('checked_in_at')
    .eq('match_id', matchId)

  const allCheckedIn = players?.every(p => p.checked_in_at) ?? false

  if (allCheckedIn) {
    const now = new Date().toISOString()
    await supabase.from('matches').update({ started_at: now }).eq('id', matchId)

    const { data: match } = await supabase
      .from('matches')
      .select('court_id, session_id, team_a, team_b')
      .eq('id', matchId)
      .single()

    if (match) {
      await supabase.from('courts').update({ status: 'playing' }).eq('id', match.court_id)
      const allPlayers = [...(match.team_a ?? []), ...(match.team_b ?? [])]
      await supabase
        .from('queue_entries')
        .update({ status: 'playing' })
        .eq('session_id', match.session_id)
        .in('player_id', allPlayers)
        .eq('status', 'assigned')
    }
  }

  revalidatePath('/queue')
  revalidatePath('/courts')
  revalidatePath('/admin')
}
