export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; code?: string }>
}) {
  const { session: sessionId, code } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=/checkin?session=${sessionId}&code=${code}`)
  if (!sessionId || !code) redirect('/queue')

  const { data } = await supabase.rpc('validate_checkin_code', {
    p_session_id: sessionId,
    p_code: code,
  })

  const result = data as { success: boolean; error?: string } | null
  const success = result?.success === true
  const errorMsg =
    result?.error === 'invalid_or_expired_code'
      ? 'This code has expired. Ask the admin for the current code.'
      : result?.error === 'session_not_live'
      ? 'This session is not live yet.'
      : result?.error

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 text-center py-16 px-4">
      {success ? (
        <>
          <div className="w-20 h-20 rounded-2xl bg-success-bg border-2 border-black flex items-center justify-center">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#17603A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h1 className="font-heading font-extrabold italic text-4xl uppercase text-success-text">
              CHECKED IN!
            </h1>
            <p className="text-body text-sm mt-2">
              You&apos;re at the venue. Head to the queue to join.
            </p>
          </div>
          <Link
            href="/queue"
            className="h-14 w-full max-w-[280px] rounded-[16px] border-2 border-black bg-black text-white font-heading font-extrabold italic text-xl uppercase flex items-center justify-center shadow-[4px_4px_0_#111]"
          >
            JOIN QUEUE
          </Link>
        </>
      ) : (
        <>
          <div className="w-20 h-20 rounded-2xl bg-danger-bg border-2 border-black flex items-center justify-center">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B3201A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h1 className="font-heading font-extrabold italic text-4xl uppercase text-danger-text">
              CHECK-IN FAILED
            </h1>
            <p className="text-body text-sm mt-2">{errorMsg ?? 'Something went wrong.'}</p>
          </div>
          <Link href="/queue" className="text-sm font-bold underline">
            Go to queue
          </Link>
        </>
      )}
    </div>
  )
}
