'use client'

interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({ options, value, onChange, className = '' }: Props<T>) {
  return (
    <div className={`flex bg-muted rounded-[14px] p-1 gap-1 ${className}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 h-9 rounded-[10px] text-sm font-bold transition-all ${
            value === opt.value
              ? 'bg-white border-2 border-black shadow-[2px_2px_0_#111111]'
              : 'text-body'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
