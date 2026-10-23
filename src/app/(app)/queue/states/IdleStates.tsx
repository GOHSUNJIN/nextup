import Link from 'next/link'
import { BigActionButton } from '@/components/ui/BigActionButton'

export function NoSession() {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-black rounded-[18px] overflow-hidden px-5 pt-5 pb-6">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow rounded-full opacity-90" />
        <div className="absolute -top-3 -right-3 w-14 h-14 bg-yellow rounded-full" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-2">Queue</p>
          <h1 className="font-heading font-extrabold italic text-5xl uppercase leading-none text-white">
            No session<br />live
          </h1>
          <p className="text-[#BDB9AF] text-sm mt-3">Check back when an event starts.</p>
        </div>
      </div>
      <Link href="/events" className="text-sm font-bold underline text-center text-body">
        View upcoming events →
      </Link>
    </div>
  )
}

export function SessionEnded({ sessionName }: { sessionName?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-black text-white rounded-[18px] px-5 py-8 text-center relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-yellow rounded-full opacity-15" />
        <div className="relative">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#BDB9AF] mb-3">
            {sessionName}
          </p>
          <p className="font-heading font-extrabold italic text-5xl text-yellow uppercase leading-tight">
            Session<br />Ended
          </p>
          <p className="text-[#BDB9AF] text-sm mt-3">Thanks for playing! Check your match history.</p>
        </div>
      </div>
      <Link href="/history">
        <BigActionButton type="button" size="lg">VIEW MY STATS</BigActionButton>
      </Link>
    </div>
  )
}
