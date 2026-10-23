'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { deleteAccount } from '@/app/actions/auth'
import { BigActionButton } from '@/components/ui/BigActionButton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function SettingsPage() {
  const [showDelete, setShowDelete] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteAccount()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center bg-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">SETTINGS</h1>
      </div>

      <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden">
        <div className="px-4 py-3 border-b-2 border-black">
          <p className="text-xs font-extrabold uppercase tracking-widest text-body">Account</p>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <p className="text-sm text-body leading-relaxed">
            Deleting your account will anonymise your profile data. Your match history will be preserved but your name and contact details will be removed. This action cannot be undone.
          </p>
          <BigActionButton
            type="button"
            variant="danger"
            size="md"
            onClick={() => setShowDelete(true)}
          >
            DELETE ACCOUNT
          </BigActionButton>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete account?"
        body="Your profile data will be anonymised. This cannot be undone."
        confirmLabel={pending ? 'Deleting…' : 'Delete'}
        danger
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
