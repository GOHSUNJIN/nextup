'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendPushToPlayers } from '@/lib/push'

async function requireStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await createAdminClient()
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'co_admin'].includes(profile.role)) return null
  return user
}

export async function endSession(sessionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('end_session', { p_session_id: sessionId })
  if (error) return { error: error.message }

  const result = data as { success?: boolean; error?: string }
  if (result?.error) return { error: result.error }

  const admin = createAdminClient()
  const { data: players } = await admin
    .from('queue_entries')
    .select('player_id')
    .eq('session_id', sessionId)

  if (players?.length) {
    await sendPushToPlayers(
      players.map((p: { player_id: string }) => p.player_id),
      { title: 'Session ended', body: 'Thanks for playing! Check your history for stats.', url: '/history' }
    )
  }

  revalidatePath('/queue')
  revalidatePath('/courts')
  revalidatePath('/admin')
}

export async function handleNoShows(sessionId: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('handle_no_shows', { p_session_id: sessionId })
  if (error) return { error: error.message }

  const admin = createAdminClient()
  const { data: newly } = await admin
    .from('queue_entries')
    .select('player_id')
    .eq('session_id', sessionId)
    .eq('status', 'assigned')

  if (newly?.length) {
    await sendPushToPlayers(
      newly.map((p: { player_id: string }) => p.player_id),
      { title: "You're up!", body: 'Head to your court. 3 minutes to check in.', url: '/queue' }
    )
  }

  revalidatePath('/queue')
  revalidatePath('/courts')
  revalidatePath('/admin')
}

export async function endMatch(matchId: string, scoreA: number, scoreB: number) {
  const user = await requireStaff()
  if (!user) return { error: 'Not authorized' }
  const supabase = await createClient()

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
    await supabase
      .from('queue_entries')
      .update({ status: 'finished', finished_at: new Date().toISOString() })
      .eq('session_id', match.session_id)
      .in('player_id', allPlayers)
      .in('status', ['playing', 'assigned'])
  }

  if (match.session_id) {
    const admin = createAdminClient()
    await admin.rpc('fill_courts', { p_session_id: match.session_id })
  }

  revalidatePath('/admin')
  revalidatePath('/courts')
}

export async function startSession(sessionId: string) {
  const supabase = await createClient()
  const { data } = await supabase.rpc('start_session', { p_session_id: sessionId })
  const result = data as { success?: boolean; error?: string } | null
  if (result?.error) return { error: result.error }

  revalidatePath('/admin')
  revalidatePath('/courts')
}

export async function changeCourtType(courtId: string, type: string) {
  const user = await requireStaff()
  if (!user) return { error: 'Not authorized' }
  const supabase = await createClient()
  await supabase.from('courts').update({ type, next_type: type }).eq('id', courtId)
  revalidatePath('/admin')
  revalidatePath('/courts')
}

export async function addWalkIn(sessionId: string, name: string, gender: string) {
  const user = await requireStaff()
  if (!user) return { error: 'Not authorized' }
  const supabase = await createClient()

  const { data: walkIn, error } = await createAdminClient()
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

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: profile } = await createAdminClient()
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'co_admin'].includes(profile.role))
    return { error: 'Not authorized' }

  const name = formData.get('name') as string
  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const maxPlayers = parseInt(formData.get('max_players') as string) || 40
  const reminderMins = parseInt(formData.get('match_reminder_minutes') as string) || 20
  const numCourts = Math.min(10, Math.max(1, parseInt(formData.get('num_courts') as string) || 4))
  const courtType = (formData.get('court_type') as string) || 'open'

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
