import { type ReactNode } from 'react'

interface Props {
  title: string
  body?: string
  icon?: ReactNode
  action?: ReactNode
  shadow?: boolean
  className?: string
}

export function NoticeCard({ title, body, icon, action, shadow = true, className = '' }: Props) {
  return (
    <section
      className={`bg-white border-2 border-black rounded-[18px] p-4 flex flex-col gap-3 ${shadow ? 'shadow-hard' : ''} ${className}`}
    >
      {icon && (
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-xl bg-yellow border-2 border-black flex items-center justify-center shrink-0">
            {icon}
          </div>
          <h2 className="font-heading font-extrabold italic text-2xl leading-tight uppercase">
            {title}
          </h2>
        </div>
      )}
      {!icon && (
        <h2 className="font-heading font-extrabold italic text-2xl leading-tight uppercase">
          {title}
        </h2>
      )}
      {body && (
        <p className="text-[13px] leading-relaxed text-[#2E2C27]">{body}</p>
      )}
      {action}
    </section>
  )
}
