import Link from 'next/link'

const FAQS = [
  {
    q: 'How does the queue work?',
    a: 'Check in at the venue, then join the queue. When a court is free, the system assigns you and your partner(s) automatically. You\'ll get a notification when it\'s your turn.',
  },
  {
    q: 'What are court types?',
    a: 'Open courts are for all players. Casual courts are for social/beginners. Strong courts are for competitive players. Women\'s courts are reserved for female players. Mixed courts have at least one player of each gender per team.',
  },
  {
    q: 'Can I choose my partner?',
    a: 'Yes — send a pair request to another player in the queue. If they accept, you\'ll be assigned to the same court together.',
  },
  {
    q: 'What happens if I miss my turn?',
    a: 'You\'ll receive a notification when you\'re next. If you don\'t respond in time, you may be moved to the back of the queue or given a strike depending on session rules.',
  },
  {
    q: 'What is the skill tier for?',
    a: 'Skill tiers (D, C, B, A, Open) help the system assign balanced courts in competitive sessions. In casual sessions all tiers play together.',
  },
  {
    q: 'How is my gender used?',
    a: 'Gender is only used to enforce Women\'s and Mixed court rules. It is never shared with third parties.',
  },
]

export default function FaqPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center bg-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">HELP &amp; FAQ</h1>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((item, i) => (
          <details key={i} className="bg-white border-2 border-black rounded-[18px] overflow-hidden group">
            <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none">
              <span className="text-sm font-bold pr-3">{item.q}</span>
              <svg
                className="shrink-0 transition-transform group-open:rotate-180"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="px-4 pb-4">
              <p className="text-sm text-body leading-relaxed">{item.a}</p>
            </div>
          </details>
        ))}
      </div>

      <div id="privacy" className="bg-white border-2 border-black rounded-[18px] p-4">
        <p className="text-xs font-extrabold uppercase tracking-widest text-body mb-2">Privacy Policy</p>
        <p className="text-sm text-body leading-relaxed">
          NextUp by Picklepedia collects your name, email, phone number, and gender solely for the purpose of running pickleball sessions. This data is not shared with third parties. You may request deletion of your account at any time via Settings. We comply with Singapore&apos;s Personal Data Protection Act (PDPA).
        </p>
      </div>
    </div>
  )
}
