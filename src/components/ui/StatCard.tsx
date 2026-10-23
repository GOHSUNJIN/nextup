interface Cell {
  value: string | number
  label: string
}

interface Props {
  cells: [Cell, Cell, Cell]
  className?: string
}

export function StatCard({ cells, className = '' }: Props) {
  return (
    <div className={`bg-dark-card rounded-[18px] grid grid-cols-3 ${className}`}>
      {cells.map((cell, i) => (
        <div
          key={i}
          className={`px-4 py-3.5 flex flex-col gap-1 ${i > 0 ? 'border-l border-dark-divider' : ''}`}
        >
          <span className="font-heading font-extrabold italic text-[34px] leading-none text-yellow">
            {cell.value}
          </span>
          <span className="text-[11px] font-bold text-dark-muted">{cell.label}</span>
        </div>
      ))}
    </div>
  )
}
