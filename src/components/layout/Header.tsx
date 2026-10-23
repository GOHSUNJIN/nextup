import Link from 'next/link'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'

type Role = 'player' | 'co_admin' | 'admin' | 'guest'

interface Props {
  name?: string
  role?: Role
  avatarUrl?: string | null
}

const ROLE_LABEL: Record<Role, string> = {
  player:   'Player',
  co_admin: 'Co-admin',
  admin:    'Admin',
  guest:    'Not signed in',
}

const ROLE_COLOR: Record<Role, string> = {
  player:   'text-body',
  co_admin: 'text-brand',
  admin:    'text-brand',
  guest:    'text-body',
}

export function Header({ name = 'Guest', role = 'guest', avatarUrl }: Props) {
  return (
    <header className="px-5 pt-4 pb-1.5 flex items-center justify-between shrink-0 bg-bg">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        {/* App icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon.svg" alt="" width={40} height={40} aria-hidden="true" />
        <div className="flex flex-col gap-px">
          <span
            className="font-wordmark text-2xl leading-none tracking-wide text-white"
            style={{ WebkitTextStroke: '1.2px #111111', textShadow: '2px 2px 0 #111111' }}
          >
            NEXT<span className="text-yellow">UP</span>
          </span>
          <span className="text-[10px] font-extrabold tracking-[1.5px]">BY PICKLEPEDIA</span>
        </div>
      </div>

      {/* User info */}
      <Link href="/profile" className="flex items-center gap-2 min-h-[44px]">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[13px] font-extrabold leading-tight whitespace-nowrap">{name}</span>
          <span className={`text-[11px] font-semibold ${ROLE_COLOR[role]}`}>
            {ROLE_LABEL[role]}
          </span>
        </div>
        <PlayerAvatar name={name} role={role} avatarUrl={avatarUrl} size={38} />
      </Link>
    </header>
  )
}
