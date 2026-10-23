'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavTab {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number | null
}

const CourtsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)
const QueueIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)
const HistoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
)
const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
)
const AdminIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

interface Props {
  isAdmin?: boolean
  isCoadmin?: boolean
  queuePosition?: number | null
}

export function BottomNav({ isAdmin = false, isCoadmin = false, queuePosition }: Props) {
  const pathname = usePathname()
  const isStaff = isAdmin || isCoadmin

  const tabs: NavTab[] = [
    { href: '/courts',  label: 'Courts',  icon: <CourtsIcon /> },
    { href: '/queue',   label: 'Queue',   icon: <QueueIcon />, badge: queuePosition },
    { href: '/history', label: 'History', icon: <HistoryIcon /> },
    { href: '/profile', label: 'Profile', icon: <ProfileIcon /> },
    ...(isStaff ? [{ href: '/admin', label: 'Admin', icon: <AdminIcon /> }] : []),
  ]

  return (
    <nav
      aria-label="Main"
      className="h-[78px] bg-black flex items-stretch px-1 pb-2.5 shrink-0"
    >
      {tabs.map(tab => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold relative transition-colors ${
              active ? 'text-yellow' : 'text-[#BDB9AF]'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="absolute top-1 right-1/4 min-w-[16px] h-4 rounded-full bg-yellow text-black text-[9px] font-extrabold flex items-center justify-center px-1">
                {tab.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
