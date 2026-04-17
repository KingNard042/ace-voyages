import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'sale' | 'new' | 'featured'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[#D4A017] text-[#1A1A2E]',
  sale: 'bg-[#ff9b43] text-[#1A1A2E]',
  new: 'bg-[#10b981] text-white',
  featured: 'bg-[#1B3A6B] text-white',
}

export default function Badge({ label, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        variants[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
