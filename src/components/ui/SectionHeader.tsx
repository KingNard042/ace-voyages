import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}

export default function SectionHeader({
  title,
  subtitle,
  align = 'left',
  className,
}: SectionHeaderProps) {
  const centered = align === 'center'

  return (
    <div className={cn('flex flex-col gap-3', centered && 'items-center', className)}>
      <div className={cn('flex flex-col gap-2', centered && 'items-center')}>
        <h2
          className={cn(
            'text-2xl font-bold leading-tight text-[#1A1A2E] sm:text-3xl lg:text-4xl',
            centered && 'text-center'
          )}
          style={{ fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}
        >
          {title}
        </h2>
        <div className={cn('h-1 w-12 rounded-full bg-[#D4A017]', centered && 'mx-auto')} />
      </div>
      {subtitle && (
        <p
          className={cn(
            'max-w-2xl text-base leading-relaxed text-[#6B7280]',
            centered && 'text-center'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
