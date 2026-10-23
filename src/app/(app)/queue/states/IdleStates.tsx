import Link from 'next/link'

export function NoSession() {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-black rounded-[18px] overflow-hidden px-5 pt-5 pb-8">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow rounded-full opacity-20" />
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow rounded-full opacity-40" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">Queue</p>
          <h1 className="font-heading font-extrabold italic text-5xl uppercase leading-none text-white">
            No session<br />live
          </h1>
          <p className="text-[#BDB9AF] text-sm mt-3">Check back when an event starts.</p>
        </div>
      </div>
      <Link href="/events">
        <div className="w-full h-[52px] border-2 border-black bg-brand text-white rounded-[14px] font-heading font-extrabold italic text-xl uppercase flex items-center justify-center shadow-[4px_4px_0_#111]">
          VIEW EVENTS
        </div>
      </Link>
    </div>
  )
}

export function SessionEnded({ sessionName }: { sessionName?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-black rounded-[18px] overflow-hidden px-5 pt-5 pb-8">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow rounded-full opacity-20" />
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow rounded-full opacity-40" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">
            {sessionName ?? 'Session'}
          </p>
          <h1 className="font-heading font-extrabold italic text-5xl text-yellow uppercase leading-tight">
            Session<br />ended
          </h1>
          <p className="text-[#BDB9AF] text-sm mt-3">Thanks for playing! Check your match history.</p>
        </div>
      </div>
      <Link href="/history">
        <div className="w-full h-[56px] border-2 border-black bg-brand text-white rounded-[16px] font-heading font-extrabold italic text-[22px] uppercase flex items-center justify-center shadow-[4px_4px_0_#111]">
          VIEW MY STATS
        </div>
      </Link>
    </div>
  )
}
