import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'purple' | 'pink' | 'blue' | 'none'
  hover?: boolean
}

export function Card({ className, glow = 'none', hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm',
        'shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]',
        hover && 'hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer',
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
