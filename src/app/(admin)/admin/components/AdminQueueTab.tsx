import { createClient } from '@/lib/supabase/server'
import { AddWalkInForm } from './AddWalkInForm'

type Session = { id: string } | null

export async function AdminQueueTab({ session }: { session: Session }) {
  if (!session) {
    return <p className="text-body text-sm text-center py-8">No live session.</p>
  }

  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('queue_entries')
    .select('id, status, mode, queue_position, player_id, profiles(name, is_walk_in)')
    .eq('session_id', session.id)
    .in('status', ['waiting', 'assigned', 'standby', 'playing'])
    .order('queue_position')
    .limit(50)

  return (
    <div className="flex flex-col gap-4">
      <AddWalkInForm sessionId={session.id} />

      <div className="flex flex-col gap-2">
        <p className="text-xs font-extrabold uppercase tracking-widest text-body">
          Queue · {entries?.length ?? 0} players
        </p>
        {entries?.map((e, i) => {
          const profile = e.profiles as unknown as { name: string | null; is_walk_in: boolean | null } | null
          return (
            <div key={e.id} className="bg-white border-2 border-black rounded-[14px] px-4 py-3 flex items-center gap-3">
              <span className="font-heading font-extrabold italic text-lg w-7 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{profile?.name ?? 'Unknown'}</p>
                <p className="text-xs text-body capitalize">
                  {e.mode} · {e.status}{profile?.is_walk_in ? ' · Walk-in' : ''}
                </p>
              </div>
            </div>
          )
        })}
        {!entries?.length && (
          <p className="text-body text-sm text-center py-4">Queue is empty.</p>
        )}
      </div>
    </div>
  )
}
