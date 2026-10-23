import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'black' | 'white' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white border-black shadow-hard',
  black:   'bg-black text-white border-black shadow-hard',
  white:   'bg-white text-black border-black shadow-hard',
  danger:  'bg-danger-bg text-danger-text border-danger-text',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'md' | 'lg' | 'xl'
}

const SIZES = {
  md: 'h-[52px] text-xl rounded-[14px]',
  lg: 'h-[56px] text-[22px] rounded-[16px]',
  xl: 'h-[60px] text-[26px] rounded-[16px]',
}

export function BigActionButton({
  variant = 'primary',
  size = 'lg',
  className = '',
  children,
  ...props
}: Props) {
  return (
    <button
      className={`w-full border-2 font-heading font-extrabold italic uppercase flex items-center justify-center transition-opacity disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
