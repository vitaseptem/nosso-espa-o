import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'purple' | 'pink' | 'blue' | 'green' | 'red' | 'gray'
  className?: string
}

const variants = {
  purple: 'bg-nebula-purple/20 text-nebula-purple border-nebula-purple/30',
  pink:   'bg-nebula-pink/20 text-nebula-pink border-nebula-pink/30',
  blue:   'bg-nebula-blue/20 text-nebula-blue border-nebula-blue/30',
  green:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  red:    'bg-red-500/20 text-red-400 border-red-500/30',
  gray:   'bg-white/10 text-white/60 border-white/10',
}

export function Badge({ children, variant = 'purple', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variants[variant], className
    )}>
      {children}
    </span>
  )
}
