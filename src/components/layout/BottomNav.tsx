import { NavLink } from 'react-router-dom'
import { Home, Clock, Image, Calendar, MessageCircle, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotificationStore } from '@/stores/notificationStore'

const navItems = [
  { to: '/',           icon: Home,           label: 'Início' },
  { to: '/timeline',   icon: Clock,          label: 'Timeline' },
  { to: '/album',      icon: Image,          label: 'Álbum' },
  { to: '/calendario', icon: Calendar,       label: 'Agenda' },
  { to: '/chat',       icon: MessageCircle,  label: 'Chat',  badge: true },
  { to: '/valentina',  icon: Heart,          label: 'Valentin.' },
]

export function BottomNav({ className }: { className?: string }) {
  const { unreadCount } = useNotificationStore()

  return (
    <nav className={cn(
      'fixed bottom-0 inset-x-0 z-40 bg-space-950/90 backdrop-blur-xl border-t border-white/[0.06]',
      'flex items-center justify-around px-2 pb-safe-area-inset-bottom',
      className
    )}>
      {navItems.map(item => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'}>
          {({ isActive }) => (
            <div className="flex flex-col items-center gap-0.5 py-3 px-3 relative">
              <div className={cn(
                'relative p-1.5 rounded-xl transition-all duration-200',
                isActive ? 'bg-nebula-purple/20' : ''
              )}>
                <item.icon className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-nebula-purple' : 'text-white/40'
                )} />
                {item.badge && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-nebula-pink text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] transition-colors', isActive ? 'text-nebula-purple' : 'text-white/30')}>
                {item.label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
