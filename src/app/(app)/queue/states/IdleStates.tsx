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
      {/* Queue explainer */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-extrabold uppercase tracking-widest text-body px-1">How the queue works</p>
        {[
          { n: '1', title: 'Check in at the venue', body: 'Enter the 4-digit code on the admin screen when you arrive.', color: 'bg-yellow', textColor: 'text-black' },
          { n: '2', title: 'Join the queue', body: 'Tap join below once checked in. You\'ll get a position number.', color: 'bg-brand', textColor: 'text-white' },
          { n: '3', title: 'Play when it\'s your turn', body: 'Get notified and assigned to a court with 3 other players.', color: 'bg-black', textColor: 'text-white' },
        ].map(step => (
          <div key={step.n} className="bg-white border-2 border-black rounded-[16px] p-3 flex gap-3 items-start">
            <div className={`w-8 h-8 rounded-full ${step.color} border-2 border-black flex items-center justify-center shrink-0`}>
              <span className={`font-heading font-extrabold text-sm ${step.textColor}`}>{step.n}</span>
            </div>
            <div>
              <p className="font-bold text-sm">{step.title}</p>
              <p className="text-xs text-body mt-0.5">{step.body}</p>
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
