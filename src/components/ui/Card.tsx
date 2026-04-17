import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-[#F3F4F6] p-6',
        hover &&
          'transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(26,28,28,0.08)]',
        className
      )}
    >
      {children}
    </div>
  )
}
