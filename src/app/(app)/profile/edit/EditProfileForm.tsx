'use client'
import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { updateProfile } from '@/app/actions/auth'
import { BigActionButton } from '@/components/ui/BigActionButton'
import { createClient } from '@/lib/supabase/client'

interface Props {
  name: string
  phone: string
  gender: string
  avatarUrl: string | null
  userId: string
}

export function EditProfileForm({ name, phone, gender, avatarUrl, userId }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(avatarUrl)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) { setError('Upload failed: ' + uploadError.message); return }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setCurrentAvatar(data.publicUrl + '?t=' + Date.now())
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    if (currentAvatar !== avatarUrl) fd.set('avatar_url', currentAvatar ?? '')
    startTransition(async () => {
      const result = await updateProfile(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center bg-white shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-heading font-extrabold italic text-3xl uppercase">EDIT PROFILE</h1>
      </div>

      {/* Avatar hero */}
      <div className="relative bg-black rounded-[18px] overflow-hidden px-5 py-5">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow rounded-full opacity-15" />
        <div className="absolute -top-2 -right-2 w-16 h-16 bg-yellow rounded-full opacity-20" />
        <div className="relative flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative w-20 h-20 rounded-full border-[3px] border-yellow overflow-hidden bg-[#222] flex items-center justify-center"
          >
            {currentAvatar ? (
              <Image src={currentAvatar} alt="Avatar" fill className="object-cover" unoptimized />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#BDB9AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
          </button>
          <p className="text-[#BDB9AF] text-xs">{uploading ? 'Uploading…' : 'Tap to change photo'}</p>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="avatar_url" value={currentAvatar ?? ''} />
        <div className="bg-white border-2 border-black rounded-[18px] overflow-hidden">
          <div className="px-4 py-2 border-b-2 border-black bg-muted">
            <p className="text-xs font-extrabold uppercase tracking-widest text-body">Your info</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-body" htmlFor="name">Full name</label>
              <input
                id="name" name="name" type="text" required autoComplete="off"
                defaultValue={name}
                className="h-11 rounded-[10px] border-2 border-black bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-body" htmlFor="phone">
                Phone <span className="normal-case font-normal tracking-normal text-body">(optional)</span>
              </label>
              <input
                id="phone" name="phone" type="tel" autoComplete="off"
                defaultValue={phone}
                placeholder="+65 9123 4567"
                className="h-11 rounded-[10px] border-2 border-black bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold uppercase tracking-widest text-body">Gender</label>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map(g => (
                  <label key={g} className="flex-1">
                    <input type="radio" name="gender" value={g} defaultChecked={gender === g} className="sr-only peer" />
                    <span className="flex h-11 items-center justify-center rounded-[10px] border-2 border-black bg-white text-sm font-bold capitalize cursor-pointer peer-checked:bg-black peer-checked:text-white transition-colors">
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-danger-text bg-danger-bg rounded-xl px-3 py-2 mt-3">{error}</p>
        )}

        <div className="mt-3">
          <BigActionButton type="submit" disabled={pending || uploading} size="lg">
            {pending ? 'Saving…' : 'SAVE CHANGES'}
          </BigActionButton>
        </div>
      </form>
    </div>
  )
}
