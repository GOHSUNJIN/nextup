import { StatusPill } from './StatusPill'

type CourtType = 'open' | 'strong' | 'casual' | 'women' | 'mixed'
type CourtStatus = 'empty' | 'assigned' | 'playing' | 'paused'

const TYPE_LABELS: Record<CourtType, string> = {
  open:   'Open',
  strong: 'Strong',
  casual: 'Casual',
  women:  'Women',
  mixed:  'Mixed',
}

const STATUS_VARIANT = {
  empty:    'muted',
  assigned: 'yellow',
  playing:  'live',
  paused:   'outline',
} as const

const STATUS_LABEL = {
  empty:    'Empty',
  assigned: 'Checking in',
  playing:  'Playing',
  paused:   'Paused',
}

const NUM_TILES = [
  { bg: 'bg-black',     text: 'text-white' },
  { bg: 'bg-brand',     text: 'text-white' },
  { bg: 'bg-yellow',    text: 'text-black' },
  { bg: 'bg-dark-cell', text: 'text-white' },
]

interface Props {
  num: number
  name: string
  type: CourtType
  status: CourtStatus
  teamA?: string
  teamB?: string
  minsPlaying?: number
  className?: string
}

export function CourtCard({ num, name, type, status, teamA, teamB, minsPlaying, className = '' }: Props) {
  const tile = NUM_TILES[(num - 1) % NUM_TILES.length]
  const isEmpty = status === 'empty'
  const hasTeams = !isEmpty && teamA && teamB

  return (
    <article className={`bg-white border-2 border-black rounded-[18px] p-3.5 flex items-start gap-3 ${className}`}>
      <div
        className={`${tile.bg} ${tile.text} w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 font-heading font-extrabold italic text-2xl leading-none`}
      >
        {num}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="font-extrabold text-[15px]">{name}</span>
          <span className="text-[11px] font-extrabold border-[1.5px] border-black rounded-full px-2 py-px">
            {TYPE_LABELS[type]}
          </span>
          <StatusPill
            label={STATUS_LABEL[status] + (minsPlaying ? ` · ${minsPlaying} min` : '')}
            variant={STATUS_VARIANT[status]}
            dot={status === 'playing'}
          />
        </div>

        {hasTeams && (
          <div className="text-[13px] leading-snug">
            {teamA} <span className="text-body font-bold">vs</span> {teamB}
          </div>
        )}
        {isEmpty && (
          <div className="text-[13px] text-body">Waiting for players…</div>
        )}
      </div>
    </article>
  )
}
