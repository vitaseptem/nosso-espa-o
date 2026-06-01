import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nebula-purple/50 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          {
            'bg-gradient-to-r from-nebula-violet to-nebula-purple hover:from-nebula-purple hover:to-nebula-pink text-white shadow-glow-purple hover:shadow-glow-pink': variant === 'primary',
            'bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm': variant === 'secondary',
            'hover:bg-white/10 text-white/70 hover:text-white': variant === 'ghost',
            'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30': variant === 'danger',
            'border border-nebula-purple/50 hover:border-nebula-purple text-nebula-purple hover:bg-nebula-purple/10': variant === 'outline',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-7 py-3.5 text-base': size === 'lg',
            'w-10 h-10 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : children}
      </button>
    )
  }
)
Button.displayName = 'Button'
