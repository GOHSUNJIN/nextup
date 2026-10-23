import Link from 'next/link'

const FAQS = [
  {
    q: 'How does the queue work?',
    a: 'Check in at the venue, then join the queue. The system assigns you to a court automatically when it\'s your turn.',
  },
  {
    q: 'What are court types?',
    a: 'Open: all levels. Casual: social/beginners. Strong: competitive. Women\'s: female players only. Mixed: one of each gender per team.',
  },
  {
    q: 'Can I choose my partner?',
    a: 'Yes — send a pair request to another player in the queue. If they accept, you\'ll share a court.',
  },
  {
    q: 'What if I miss my turn?',
    a: 'You\'ll be notified when you\'re next. No response may move you to the back of the queue.',
  },
  {
    q: 'What is the skill tier for?',
    a: 'Tiers (D, C, B, A, Open) help balance courts in competitive sessions.',
  },
  {
    q: 'How is my gender used?',
    a: 'Only to enforce Women\'s and Mixed court rules. Never shared with third parties.',
  },
]

export default function FaqPage() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center bg-white shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">HELP &amp; FAQ</h1>
      </div>

      <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden divide-y-2 divide-black">
        {FAQS.map((item, i) => (
          <details key={i} className="group">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none gap-3">
              <span className="text-sm font-bold">{item.q}</span>
              <svg
                className="shrink-0 transition-transform group-open:rotate-180"
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="px-4 pb-3 border-t-2 border-black bg-muted">
              <p className="text-xs text-body leading-relaxed pt-2">{item.a}</p>
            </div>
          </details>
        ))}
      </div>

      <p className="text-center text-xs text-body">
        We comply with Singapore&apos;s PDPA. Your data is never shared.{' '}
        <Link href="/profile/faq#privacy" className="font-bold underline">Privacy policy</Link>
      </p>
    </div>
  )
}
