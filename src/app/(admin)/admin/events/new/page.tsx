'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createEvent } from '@/app/actions/sessions'

export default function CreateEventPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createEvent(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center bg-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">New event</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Event name">
          <input name="name" type="text" required placeholder="Friday Evening Pickleball" className={inputCls} />
        </Field>
        <Field label="Date">
          <input name="date" type="date" required className={inputCls} />
        </Field>
        <div className="flex gap-3">
          <Field label="Start time" className="flex-1">
            <input name="start_time" type="time" required className={inputCls} />
          </Field>
          <Field label="End time" className="flex-1">
            <input name="end_time" type="time" required className={inputCls} />
          </Field>
        </div>
        <div className="flex gap-3">
          <Field label="Max players" className="flex-1">
            <input name="max_players" type="number" min={4} max={200} defaultValue={40} className={inputCls} />
          </Field>
          <Field label="Match reminder (min)" className="flex-1">
            <input name="match_reminder_minutes" type="number" min={5} max={60} defaultValue={20} className={inputCls} />
          </Field>
        </div>
        <div className="flex gap-3">
          <Field label="Number of courts" className="flex-1">
            <input name="num_courts" type="number" min={1} max={10} defaultValue={4} className={inputCls} />
          </Field>
          <Field label="Default court type" className="flex-1">
            <select name="court_type" className={inputCls}>
              <option value="open">Open</option>
              <option value="strong">Strong</option>
              <option value="casual">Casual</option>
              <option value="women">Women</option>
              <option value="mixed">Mixed</option>
            </select>
          </Field>
        </div>

        {error && <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="h-14 rounded-[16px] border-2 border-black bg-black text-white font-heading font-extrabold italic text-xl uppercase shadow-[4px_4px_0_#111] disabled:opacity-50"
        >
          {pending ? 'Creating…' : 'CREATE EVENT'}
        </button>
      </form>
    </div>
  )
}

const inputCls = 'w-full h-12 rounded-[12px] border-2 border-black bg-white px-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-black'

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold">{label}</label>
      {children}
    </div>
  )
}
