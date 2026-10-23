'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendPushToPlayers } from '@/lib/push'

async function getNextQueuePosition(supabase: Awaited<ReturnType<typeof createClient>>, sessionId: string) {
  const { data: last } = await supabase
    .from('queue_entries')
    .select('queue_position')
    .eq('session_id', sessionId)
    .order('queue_position', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (last?.queue_position ?? 0) + 1
}

async function notifyAssigned(sessionId: string) {
  const admin = createAdminClient()
  const { data: newly } = await admin
    .from('queue_entries')
    .select('player_id')
    .eq('session_id', sessionId)
    .eq('status', 'assigned')
  if (newly?.length) {
    await sendPushToPlayers(
      newly.map((p: { player_id: string }) => p.player_id),
      { title: "You're up!", body: 'Head to your court — 3 minutes to check in.', url: '/queue' }
    )
  }
}

export async function joinQueue(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const queuePosition = await getNextQueuePosition(supabase, sessionId)

  const [sessionResult, countResult] = await Promise.all([
    supabase.from('sessions').select('max_players').eq('id', sessionId).single(),
    supabase.from('queue_entries').select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .in('status', ['waiting', 'assigned', 'standby', 'playing', 'on_break']),
  ])

  const isWaitlist = sessionResult.data && (countResult.count ?? 0) >= sessionResult.data.max_players

  const { error } = await supabase
    .from('queue_entries')
    .upsert({
      session_id: sessionId,
      player_id: user.id,
      mode: 'solo',
      status: isWaitlist ? 'waitlist' : 'waiting',
      queue_position: queuePosition,
      joined_at: new Date().toISOString(),
      skip_count: 0,
    }, { onConflict: 'session_id,player_id' })

  if (error) return { error: error.message }

  if (!isWaitlist) {
    const admin = createAdminClient()
    await admin.rpc('fill_courts', { p_session_id: sessionId })
    await notifyAssigned(sessionId)
  }

  revalidatePath('/queue')
  revalidatePath('/courts')
  return { waitlist: isWaitlist }
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
    .in('status', ['waiting', 'waitlist'])

  const admin = createAdminClient()
  await admin.rpc('promote_waitlist', { p_session_id: sessionId })

  revalidatePath('/queue')
}

export async function requeueOrBreak(sessionId: string, choice: 'requeue' | 'break') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  if (choice === 'requeue') {
    const queuePosition = await getNextQueuePosition(supabase, sessionId)

    await supabase.from('queue_entries').update({
      status: 'waiting',
      queue_position: queuePosition,
      joined_at: new Date().toISOString(),
      finished_at: null,
      prompt_seen_at: null,
      requeue_deadline: null,
      skip_count: 0,
    })
      .eq('session_id', sessionId)
      .eq('player_id', user.id)
      .in('status', ['finished'])

    const admin = createAdminClient()
    await admin.rpc('fill_courts', { p_session_id: sessionId })
    await notifyAssigned(sessionId)
  } else {
    await supabase.from('queue_entries').update({
      status: 'on_break',
      break_started_at: new Date().toISOString(),
      requeue_deadline: null,
      prompt_seen_at: null,
    })
      .eq('session_id', sessionId)
      .eq('player_id', user.id)
      .in('status', ['finished'])

    const admin = createAdminClient()
    await admin.rpc('promote_waitlist', { p_session_id: sessionId })
  }

  revalidatePath('/queue')
}

export async function rejoinQueue(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const queuePosition = await getNextQueuePosition(supabase, sessionId)

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
  await notifyAssigned(sessionId)

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

  const admin = createAdminClient()
  await admin.rpc('promote_waitlist', { p_session_id: sessionId })

  revalidatePath('/queue')
}

export async function markPromptSeen(sessionId: string) {
  const supabase = await createClient()
  await supabase.rpc('mark_prompt_seen', { p_session_id: sessionId })
}
