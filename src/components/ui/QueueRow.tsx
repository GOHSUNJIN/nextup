type QueueMode = 'solo' | 'pair'

interface Props {
  position: number
  name: string
  mode: QueueMode
  isYou?: boolean
  isWalkin?: boolean
  className?: string
}

export function QueueRow({ position, name, mode, isYou = false, isWalkin = false, className = '' }: Props) {
  return (
    <li
      className={`flex items-center gap-2.5 px-3 py-[9px] border-b border-[#E3E0D8] last:border-b-0 ${isYou ? 'bg-yellow' : ''} ${className}`}
    >
      <span className="w-[26px] font-heading font-extrabold italic text-xl leading-none shrink-0">
        {position}
      </span>
      <span className={`flex-1 text-sm font-bold truncate ${isYou ? 'text-black' : ''}`}>
        {name}{isYou && ' (you)'}
      </span>
      <span className="text-[11px] font-extrabold bg-muted text-body rounded-full px-2 py-0.5 shrink-0">
        {isWalkin ? 'Walk-in' : mode === 'pair' ? 'Pair' : 'Solo'}
      </span>
    </li>
  )
}
