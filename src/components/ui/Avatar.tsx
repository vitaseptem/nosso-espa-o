import { cn, getInitials } from '@/lib/utils'
import type { User } from '@/types/database'

interface AvatarProps {
  user?: User | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showOnline?: boolean
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

const dotSizeMap = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
}

export function Avatar({ user, size = 'md', className, showOnline = false }: AvatarProps) {
  const initials = user ? getInitials(user.display_name) : '?'
  const gradient = user?.role === 'marido'
    ? 'from-nebula-blue to-nebula-violet'
    : 'from-nebula-pink to-nebula-purple'

  return (
    <div className="relative inline-flex">
      <div className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center font-semibold text-white ring-2 ring-white/10 overflow-hidden',
        gradient, sizeMap[size], className
      )}>
        {user?.avatar_url
          ? <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
          : initials
        }
      </div>
      {showOnline && user?.is_online && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full bg-emerald-400 ring-2 ring-space-900',
          dotSizeMap[size]
        )} />
      )}
    </div>
  )
}
