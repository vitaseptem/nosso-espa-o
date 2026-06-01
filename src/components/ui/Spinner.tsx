import { cn } from '@/lib/utils'

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={cn(
      'rounded-full border-2 border-nebula-purple/20 border-t-nebula-purple animate-spin',
      sizes[size], className
    )} />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-white/40 text-sm animate-pulse">Carregando...</p>
      </div>
    </div>
  )
}
