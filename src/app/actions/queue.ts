'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
    if (result.error === 'invalid_or_expired_code') return { error: 'Invalid or expired code. Ask the admin for the current code.' }
    if (result.error === 'session_not_live') return { error: 'This session is not live yet.' }
    return { error: result.error ?? 'Check-in failed.' }
  }
  revalidatePath('/queue')
}

export async function joinQueue(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  // Get max position
  const { data: last } = await supabase
    .from('queue_entries')
    .select('queue_position')
    .eq('session_id', sessionId)
    .order('queue_position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const queuePosition = (last?.queue_position ?? 0) + 1

  const { error } = await supabase
    .from('queue_entries')
    .upsert({
      session_id: sessionId,
      player_id: user.id,
      mode: 'solo',
      status: 'waiting',
      queue_position: queuePosition,
      joined_at: new Date().toISOString(),
      skip_count: 0,
    }, { onConflict: 'session_id,player_id' })

  if (error) return { error: error.message }

  // Try to fill courts
  const admin = createAdminClient()
  await admin.rpc('fill_courts', { p_session_id: sessionId })

  revalidatePath('/queue')
  revalidatePath('/courts')
}

export async function leaveQueue(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  await supabase
    .from('queue_entries')
    .update({ status: 'left' })
    .eq('session_id', sessionId)
    .eq('player_id', user.id)
    .in('status', ['waiting'])

  revalidatePath('/queue')
}

export async function playerCheckIn(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  // Record check-in
  await supabase
    .from('match_players')
    .update({ checked_in_at: new Date().toISOString() })
    .eq('match_id', matchId)
    .eq('player_id', user.id)

  // Check if all 4 checked in
  const { data: players } = await supabase
    .from('match_players')
    .select('checked_in_at')
    .eq('match_id', matchId)

  const allCheckedIn = players?.every(p => p.checked_in_at) ?? false

  if (allCheckedIn) {
    const now = new Date().toISOString()
    // Start match
    await supabase.from('matches').update({ started_at: now }).eq('id', matchId)
    // Update court to playing
    const { data: match } = await supabase
      .from('matches')
      .select('court_id, session_id, team_a, team_b')
      .eq('id', matchId)
      .single()
    if (match) {
      await supabase.from('courts').update({ status: 'playing' }).eq('id', match.court_id)
      const allPlayers = [...(match.team_a ?? []), ...(match.team_b ?? [])]
      await supabase.from('queue_entries').update({ status: 'playing' })
        .eq('session_id', match.session_id)
        .in('player_id', allPlayers)
        .eq('status', 'assigned')
    }
  }

  revalidatePath('/queue')
  revalidatePath('/courts')
  revalidatePath('/admin')
}

export async function requeueOrBreak(sessionId: string, choice: 'requeue' | 'break') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  if (choice === 'requeue') {
    // Get max position
    const { data: last } = await supabase
      .from('queue_entries')
      .select('queue_position')
      .eq('session_id', sessionId)
      .order('queue_position', { ascending: false })
      .limit(1)
      .maybeSingle()

    const queuePosition = (last?.queue_position ?? 0) + 1

    await supabase.from('queue_entries').update({
      status: 'waiting',
      queue_position: queuePosition,
      joined_at: new Date().toISOString(),
      finished_at: null,
      prompt_seen_at: null,
      skip_count: 0,
    })
      .eq('session_id', sessionId)
      .eq('player_id', user.id)
      .eq('status', 'finished')

    const admin = createAdminClient()
    await admin.rpc('fill_courts', { p_session_id: sessionId })
  } else {
    await supabase.from('queue_entries').update({
      status: 'on_break',
      break_started_at: new Date().toISOString(),
    })
      .eq('session_id', sessionId)
      .eq('player_id', user.id)
      .eq('status', 'finished')
  }

  revalidatePath('/queue')
}

export async function rejoinQueue(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: last } = await supabase
    .from('queue_entries')
    .select('queue_position')
    .eq('session_id', sessionId)
    .order('queue_position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const queuePosition = (last?.queue_position ?? 0) + 1

  await supabase.from('queue_entries').update({
    status: 'waiting',
    queue_position: queuePosition,
    joined_at: new Date().toISOString(),
    break_started_at: null,
    skip_count: 0,
  })
    .eq('session_id', sessionId)
    .eq('player_id', user.id)
    .in('status', ['on_break', 'away'])

  const admin = createAdminClient()
  await admin.rpc('fill_courts', { p_session_id: sessionId })

  revalidatePath('/queue')
}

export async function markDone(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  await supabase.from('queue_entries').update({ status: 'left' })
    .eq('session_id', sessionId)
    .eq('player_id', user.id)
    .in('status', ['on_break', 'away', 'finished'])

  revalidatePath('/queue')
}
