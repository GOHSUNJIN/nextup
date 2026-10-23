import Image from 'next/image'

type Role = 'player' | 'co_admin' | 'admin' | 'guest'

const BG: Record<Role, string> = {
  player:   'bg-yellow text-black',
  co_admin: 'bg-yellow text-black',
  admin:    'bg-brand text-white',
  guest:    'bg-muted text-body',
}

function initials(name: string) {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

interface Props {
  name: string
  role?: Role
  avatarUrl?: string | null
  size?: number   // px
  className?: string
}

export function PlayerAvatar({ name, role = 'player', avatarUrl, size = 38, className = '' }: Props) {
  const base = `rounded-full border-2 border-black flex items-center justify-center shrink-0 overflow-hidden`
  const bg = BG[role]
  const style = { width: size, height: size, fontSize: size * 0.42 }

  if (avatarUrl) {
    return (
      <div className={`${base} ${className}`} style={style}>
        <Image src={avatarUrl} alt={name} width={size} height={size} className="object-cover w-full h-full" />
      </div>
    )
  }

  if (role === 'guest') {
    return (
      <div className={`${base} ${bg} ${className}`} style={style}>
        <svg width={size * 0.47} height={size * 0.47} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`${base} ${bg} font-heading font-extrabold italic ${className}`}
      style={style}
    >
      {initials(name)}
    </div>
  )
}
