import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-white/70">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white',
          'focus:outline-none focus:border-nebula-purple/60 transition-all duration-200 appearance-none',
          '[&>option]:bg-space-800 [&>option]:text-white',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
