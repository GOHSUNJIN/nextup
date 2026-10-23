'use client'

import { useState, useTransition } from 'react'
import { updatePreferences, deleteAccount } from '@/app/actions/auth'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface Prefs {
  push_enabled: boolean
  email_enabled: boolean
  next_ping_enabled: boolean
  no_strong_courts: boolean
  women_courts_only: boolean
  gender: string | null
}

export function SettingsForm({ prefs }: { prefs: Prefs }) {
  const [showDelete, setShowDelete] = useState(false)
  const [deletePending, startDeleteTransition] = useTransition()
  const [savePending, startSaveTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteAccount()
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false)
    setSaveError(null)
    const fd = new FormData(e.currentTarget)
    startSaveTransition(async () => {
      const result = await updatePreferences(fd)
      if (result?.error) setSaveError(result.error)
      else setSaved(true)
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Section title="Notifications">
          <ToggleRow
            name="push_enabled"
            label="Push notifications"
            description="Get notified when it's your turn"
            defaultChecked={prefs.push_enabled}
          />
          <ToggleRow
            name="next_ping_enabled"
            label="You're next alert"
            description="Ping when you're 2nd in line"
            defaultChecked={prefs.next_ping_enabled}
          />
          <ToggleRow
            name="email_enabled"
            label="Email reminders"
            description="Session reminder the day before"
            defaultChecked={prefs.email_enabled}
          />
        </Section>

        <Section title="Play preferences">
          <ToggleRow
            name="no_strong_courts"
            label="Avoid strong courts"
            description="Skip courts for verified strong players"
            defaultChecked={prefs.no_strong_courts}
          />
          {prefs.gender === 'female' && (
            <ToggleRow
              name="women_courts_only"
              label="Women courts only"
              description="Only join women's courts"
              defaultChecked={prefs.women_courts_only}
            />
          )}
        </Section>

        {saved && (
          <p className="text-sm text-success-text bg-success-bg rounded-xl px-3 py-2 border border-success-text/20">
            Preferences saved.
          </p>
        )}
        {saveError && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2">{saveError}</p>
        )}

        <button
          type="submit"
          disabled={savePending}
          className="w-full h-[56px] border-2 border-black bg-brand text-white rounded-[16px] font-heading font-extrabold italic text-[22px] uppercase shadow-[4px_4px_0_#111] disabled:opacity-50 transition-opacity"
        >
          {savePending ? 'Saving…' : 'SAVE PREFERENCES'}
        </button>
      </form>

      {/* Danger zone */}
      <Section title="Account">
        <div className="p-4 flex flex-col gap-3">
          <p className="text-sm text-body leading-relaxed">
            Deleting your account will anonymise your profile data. Your match history will be preserved but your name and contact details will be removed. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="w-full h-[52px] border-2 border-danger-text bg-danger-bg text-danger-text rounded-[14px] font-heading font-extrabold italic text-xl uppercase"
          >
            DELETE ACCOUNT
          </button>
        </div>
      </Section>

      <ConfirmDialog
        open={showDelete}
        title="Delete account?"
        body="Your profile data will be anonymised. This cannot be undone."
        confirmLabel={deletePending ? 'Deleting…' : 'Delete'}
        danger
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden">
      <div className="px-4 py-3 border-b-2 border-black bg-muted">
        <p className="text-xs font-extrabold uppercase tracking-widest text-body">{title}</p>
      </div>
      <div className="divide-y-2 divide-black">
        {children}
      </div>
    </div>
  )
}

function ToggleRow({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string
  label: string
  description?: string
  defaultChecked: boolean
}) {
  const [on, setOn] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between px-4 py-3.5 gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {description && <p className="text-xs text-body mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn(o => !o)}
        className="relative shrink-0 focus:outline-none"
      >
        <input type="checkbox" name={name} checked={on} onChange={() => {}} className="sr-only" />
        <div className={`w-11 h-6 rounded-full border-2 border-black transition-colors ${on ? 'bg-yellow' : 'bg-muted'}`} />
        <div
          className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white border-2 border-black transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}
