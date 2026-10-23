import Link from 'next/link'

export function NoSession() {
  return (
    <div className="flex flex-col gap-3">
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
      {/* What you get when a session is live */}
      <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden">
        <div className="px-4 py-2 border-b-2 border-black bg-muted">
          <p className="text-xs font-extrabold uppercase tracking-widest text-body">When a session is live</p>
        </div>
        <div className="divide-y-2 divide-black">
          {[
            { icon: '🔢', title: 'Your position number', body: 'See exactly where you are in the queue in real time.' },
            { icon: '🔔', title: 'Push notifications', body: 'Get pinged when you\'re 2nd in line and when your court is ready.' },
            { icon: '🤝', title: 'Play solo or with a partner', body: 'Queue alone or send a pair request to someone already in the queue.' },
          ].map(item => (
            <div key={item.title} className="flex gap-3 items-start px-4 py-3">
              <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-xs text-body mt-0.5">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
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
