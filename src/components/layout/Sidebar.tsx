import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Clock, Image, Calendar, Brain, Smile,
  MessageCircle, Phone, Mail, Globe, Heart, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

const navItems = [
  { to: '/',           icon: Home,          label: 'Início' },
  { to: '/timeline',   icon: Clock,         label: 'Linha do Tempo' },
  { to: '/album',      icon: Image,         label: 'Álbum' },
  { to: '/calendario', icon: Calendar,      label: 'Calendário' },
  { to: '/pensamentos',icon: Brain,         label: 'Pensamentos' },
  { to: '/humor',      icon: Smile,         label: 'Humor' },
  { to: '/chat',       icon: MessageCircle, label: 'Chat' },
  { to: '/chamada',    icon: Phone,         label: 'Chamada' },
  { to: '/cartas',     icon: Mail,          label: 'Cartas' },
  { to: '/universo',   icon: Globe,         label: 'Universo' },
  { to: '/valentina',     icon: Heart,    label: 'Valentina' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export function Sidebar({ className }: { className?: string }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { unreadCount } = useNotificationStore()

  return (
    <aside className={cn('flex flex-col w-60 h-full border-r border-white/[0.05] bg-space-950/60 backdrop-blur-xl py-5', className)}>
      {/* Logo */}
      <div className="px-5 mb-6">
        <h1 className="font-display text-lg font-bold bg-gradient-to-r from-nebula-purple to-nebula-pink bg-clip-text text-transparent">
          Nosso Universo
        </h1>
        <p className="text-[11px] text-white/25 mt-0.5">Espaço privado ❤️</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-px overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}>
            {({ isActive }) => (
              <div className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 relative',
                isActive
                  ? 'bg-nebula-purple/15 text-white'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
              )}>
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-nebula-purple rounded-r-full" />}
                <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-nebula-purple' : '')} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="flex-1 font-medium">{item.label}</span>
                {item.to === '/chat' && unreadCount > 0 && (
                  <span className="bg-nebula-pink text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pt-4 border-t border-white/[0.05]">
        <button
          onClick={() => navigate('/configuracoes')}
          className="flex items-center gap-3 w-full hover:bg-white/[0.04] rounded-xl px-2 py-2 transition-colors group"
        >
          <Avatar user={user} size="sm" showOnline />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">{user?.display_name}</p>
            <p className="text-[11px] text-white/35 truncate">{user?.role}</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
        </button>
      </div>
    </aside>
  )
}
