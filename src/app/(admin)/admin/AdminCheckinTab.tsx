import { createClient } from '@/lib/supabase/server'
import { CheckinCodeDisplay } from './CheckinCodeDisplay'

type Session = { id: string } | null

export async function AdminCheckinTab({ session }: { session: Session }) {
  if (!session) return <p className="text-body text-sm text-center py-8">No live session.</p>

  const supabase = await createClient()

  const { data: checkins } = await supabase
    .from('session_checkins')
    .select('player_id, checked_in_at, profiles(name)')
    .eq('session_id', session.id)
    .order('checked_in_at')

  return (
    <div className="flex flex-col gap-3">
      {/* Rotating code display */}
      <CheckinCodeDisplay sessionId={session.id} />

      <div className="bg-black text-white rounded-[18px] px-4 py-3">
        <p className="font-heading font-extrabold italic text-4xl text-yellow">
          {checkins?.length ?? 0}
        </p>
        <p className="text-xs text-[#BDB9AF] uppercase tracking-widest mt-1">Players checked in</p>
      </div>

      <div className="bg-white border-2 border-black rounded-[18px] p-3 flex flex-col gap-px">
        <p className="text-xs font-extrabold uppercase tracking-widest text-body px-1 pb-2">
          Check-in list
        </p>
        {checkins?.map(c => {
          const profile = c.profiles as unknown as { name: string | null } | null
          return (
            <div
              key={c.player_id}
              className="flex items-center justify-between px-1 py-2 border-t border-muted first:border-0"
            >
              <span className="text-sm font-semibold">{profile?.name ?? 'Unknown'}</span>
              <span className="text-xs text-body">
                {new Date(c.checked_in_at).toLocaleTimeString('en-SG', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          )
        })}
        {!checkins?.length && (
          <p className="text-body text-sm text-center py-3">No check-ins yet.</p>
        )}
      </div>
    </div>
  )
}
