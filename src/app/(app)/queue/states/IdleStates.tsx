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
      <div className="flex flex-col gap-2">
        <p className="text-xs font-extrabold uppercase tracking-widest text-body px-1">When a session is live</p>
        {[
          {
            color: 'bg-yellow', textColor: 'text-black',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            ),
            title: 'Your position number',
            body: 'See exactly where you are in the queue in real time.',
          },
          {
            color: 'bg-brand', textColor: 'text-white',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            ),
            title: 'Push notifications',
            body: "Get pinged when you're 2nd in line and when your court is ready.",
          },
          {
            color: 'bg-black', textColor: 'text-white',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            ),
            title: 'Play solo or with a partner',
            body: 'Queue alone or send a pair request to someone in the queue.',
          },
        ].map(item => (
          <div key={item.title} className="bg-white border-2 border-black rounded-[16px] p-4 flex gap-3 items-start">
            <div className={`w-8 h-8 rounded-full ${item.color} border-2 border-black flex items-center justify-center shrink-0 ${item.textColor}`}>
              {item.icon}
            </div>
            <div>
              <p className="font-bold text-sm">{item.title}</p>
              <p className="text-xs text-body mt-0.5">{item.body}</p>
            </div>
          </div>
        ))}
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
