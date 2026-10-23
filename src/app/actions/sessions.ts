'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
    await supabase.from('session_reminders').delete()
      .eq('session_id', sessionId).eq('player_id', user.id)
  } else {
    await supabase.from('session_reminders').insert({ session_id: sessionId, player_id: user.id })
  }

  revalidatePath('/events')
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'co_admin'].includes(profile.role)) return { error: 'Not authorized' }

  const name = formData.get('name') as string
  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const maxPlayers = parseInt(formData.get('max_players') as string) || 40
  const reminderMins = parseInt(formData.get('match_reminder_minutes') as string) || 20
  const numCourts = Math.min(10, Math.max(1, parseInt(formData.get('num_courts') as string) || 4))
  const courtType = formData.get('court_type') as string || 'open'

  const startTimestamp = new Date(`${date}T${startTime}:00+08:00`).toISOString()
  const endTimestamp = new Date(`${date}T${endTime}:00+08:00`).toISOString()

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      name,
      date,
      start_time: startTimestamp,
      end_time: endTimestamp,
      max_players: maxPlayers,
      match_reminder_minutes: reminderMins,
      status: 'upcoming',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error || !session) return { error: error?.message ?? 'Failed to create event' }

  const courts = Array.from({ length: numCourts }, (_, i) => ({
    session_id: session.id,
    name: `Court ${i + 1}`,
    type: courtType,
    status: 'empty',
  }))

  await supabase.from('courts').insert(courts)

  redirect('/admin')
}

export async function endMatch(matchId: string, scoreA: number, scoreB: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: match } = await supabase
    .from('matches')
    .select('id, court_id, team_a, team_b, session_id')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match not found' }

  await supabase.from('matches').update({
    ended_at: new Date().toISOString(),
    score_a: scoreA,
    score_b: scoreB,
    ended_by: user.id,
  }).eq('id', matchId)

  await supabase.from('courts').update({ status: 'empty' }).eq('id', match.court_id)

  const allPlayers = [...(match.team_a ?? []), ...(match.team_b ?? [])]
  if (allPlayers.length > 0 && match.session_id) {
    await supabase.from('queue_entries').update({ status: 'finished', finished_at: new Date().toISOString() })
      .eq('session_id', match.session_id)
      .in('player_id', allPlayers)
      .in('status', ['playing', 'assigned'])
  }

  revalidatePath('/admin')
  revalidatePath('/courts')
}

export async function changeCourtType(courtId: string, type: string) {
  const supabase = await createClient()
  await supabase.from('courts').update({ type, next_type: type }).eq('id', courtId)
  revalidatePath('/admin')
  revalidatePath('/courts')
}

export async function addWalkIn(sessionId: string, name: string, gender: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  // Create walk-in profile
  const { data: walkIn, error } = await supabase
    .from('profiles')
    .insert({
      name,
      gender: gender as 'male' | 'female',
      role: 'player',
      is_walk_in: true,
    })
    .select('id')
    .single()

  if (error || !walkIn) return { error: error?.message ?? 'Failed to create walk-in' }

  // Get max queue position
  const { data: lastEntry } = await supabase
    .from('queue_entries')
    .select('queue_position')
    .eq('session_id', sessionId)
    .order('queue_position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const queuePosition = (lastEntry?.queue_position ?? 0) + 1

  await supabase.from('queue_entries').insert({
    session_id: sessionId,
    player_id: walkIn.id,
    mode: 'solo',
    status: 'waiting',
    queue_position: queuePosition,
  })

  revalidatePath('/admin')
}
