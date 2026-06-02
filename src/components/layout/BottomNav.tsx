import { NavLink } from 'react-router-dom'
import { Home, Clock, Image, Calendar, MessageCircle, Heart, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotificationStore } from '@/stores/notificationStore'

const navItems = [
  { to: '/',           icon: Home,           label: 'Início' },
  { to: '/timeline',   icon: Clock,          label: 'Timeline' },
  { to: '/album',      icon: Image,          label: 'Álbum' },
  { to: '/calendario', icon: Calendar,       label: 'Agenda' },
  { to: '/chat',       icon: MessageCircle,  label: 'Chat',  badge: true },
  { to: '/valentina',     icon: Heart,     label: 'Valentin.' },
  { to: '/configuracoes', icon: Settings,  label: 'Config.' },
]

export function BottomNav({ className }: { className?: string }) {
  const { unreadCount } = useNotificationStore()

  return (
    <nav className={cn(
      'fixed bottom-0 inset-x-0 z-40',
      'bg-space-950/95 backdrop-blur-xl border-t border-white/[0.05]',
      'flex items-stretch',
      'pb-[env(safe-area-inset-bottom)]',
      className
    )}>
      {navItems.map(item => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} className="flex-1">
          {({ isActive }) => (
            <div className="flex flex-col items-center gap-1 pt-2 pb-2.5 relative">
              <div className="relative">
                <item.icon className={cn(
                  'w-[22px] h-[22px] transition-all duration-200',
                  isActive ? 'text-nebula-purple' : 'text-white/35'
                )} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.badge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-nebula-pink text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[9px] leading-none transition-colors font-medium tracking-wide',
                isActive ? 'text-nebula-purple' : 'text-white/25'
              )}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 inset-x-3 h-[2px] bg-nebula-purple rounded-full" />
              )}
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
