'use client'

interface Props {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, disabled = false }: Props) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      {label && <span className="flex-1 text-sm font-semibold">{label}</span>}
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-[46px] h-[26px] rounded-full border-2 border-black transition-colors ${checked ? 'bg-black' : 'bg-muted'} disabled:opacity-50`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white border border-black transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </label>
  )
}
