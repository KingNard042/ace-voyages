'use client'

import { cn } from '@/lib/utils'
import { forwardRef, ButtonHTMLAttributes, CSSProperties } from 'react'

export type ButtonVariant = 'primary' | 'gold' | 'outlined' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 min-w-[6rem] px-4 text-sm',
  md: 'h-12 min-w-[8rem] px-6 text-base',
  lg: 'h-14 min-w-[10rem] px-8 text-lg',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white font-semibold shadow-md hover:opacity-90 active:scale-[0.98]',
  gold: 'text-[#1A1A2E] font-semibold shadow-md hover:opacity-90 active:scale-[0.98]',
  outlined:
    'bg-transparent text-[#1B3A6B] font-semibold ring-1 ring-[#1B3A6B]/25 hover:bg-[#1B3A6B]/5 active:scale-[0.98]',
  ghost:
    'bg-transparent text-[#1B3A6B] font-semibold hover:bg-[#1B3A6B]/5 active:scale-[0.98]',
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: { background: 'linear-gradient(135deg, #1B4080 0%, #1B3A6B 100%)' },
  gold: { background: 'linear-gradient(135deg, #E8B820 0%, #D4A017 100%)' },
  outlined: {},
  ghost: {},
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, style, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold',
          'transition-all duration-200 cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3A6B]/50',
          'disabled:opacity-50 disabled:pointer-events-none',
          sizes[size],
          variantClasses[variant],
          className
        )}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
