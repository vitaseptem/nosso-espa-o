import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'purple' | 'pink' | 'blue' | 'none'
  hover?: boolean
  glass?: boolean
}

export function Card({ className, glow = 'none', hover = false, glass = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white/[0.04] border border-white/[0.06]',
        'shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]',
        glass && 'backdrop-blur-md',
        hover && 'hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-200 cursor-pointer active:scale-[0.99]',
        glow === 'purple' && 'shadow-glow-purple',
        glow === 'pink' && 'shadow-glow-pink',
        glow === 'blue' && 'shadow-glow-blue',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
