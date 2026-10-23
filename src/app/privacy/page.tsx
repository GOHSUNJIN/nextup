import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — NextUp' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg px-5 py-8 flex flex-col gap-5 max-w-[430px] mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/" className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center bg-white shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">Privacy Policy</h1>
      </div>

      <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden divide-y-2 divide-black text-sm">
        <Section title="What we collect">
          <p>We collect your name, phone number, and gender when you create an account. No email address is required.</p>
        </Section>

        <Section title="Why we collect it">
          <p>Your phone number is used as your login identity. Gender is used only to enforce Women&apos;s and Mixed court rules during sessions. Your name is displayed to other players in the same session.</p>
        </Section>

        <Section title="How it is stored">
          <p>Data is stored securely on Supabase (Singapore region). We do not sell or share your personal data with third parties.</p>
        </Section>

        <Section title="PDPA compliance">
          <p>We comply with Singapore&apos;s Personal Data Protection Act (PDPA). You may request access to, correction of, or deletion of your personal data at any time by contacting us or using the &quot;Delete account&quot; option in the app.</p>
        </Section>

        <Section title="Contact">
          <p>For any data-related queries, contact the session organiser or Picklepedia.</p>
        </Section>
      </div>

      <p className="text-xs text-body text-center">Last updated: October 2026</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-4 flex flex-col gap-1.5">
      <p className="font-bold text-sm">{title}</p>
      <div className="text-xs text-body leading-relaxed">{children}</div>
    </div>
  )
}
