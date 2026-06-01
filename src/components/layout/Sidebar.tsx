import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
    <aside className={cn('flex flex-col w-64 h-full border-r border-white/[0.06] bg-space-950/50 backdrop-blur-xl py-6', className)}>
      {/* Logo */}
      <div className="px-6 mb-8">
        <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}>
          <h1 className="font-display text-xl font-bold bg-gradient-to-r from-nebula-purple via-nebula-pink to-nebula-blue bg-clip-text text-transparent">
            Nosso Universo
          </h1>
          <p className="text-xs text-white/30 mt-0.5">❤️ Espaço do casal</p>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                  isActive
                    ? 'bg-nebula-purple/20 text-white border border-nebula-purple/30'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.to === '/chat' && unreadCount > 0 && (
                  <span className="bg-nebula-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 pt-4 border-t border-white/[0.06]">
        <button
          onClick={() => navigate('/configuracoes')}
          className="flex items-center gap-3 w-full hover:bg-white/[0.05] rounded-xl px-2 py-1.5 transition-colors group"
        >
          <Avatar user={user} size="sm" showOnline />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">{user?.display_name}</p>
            <p className="text-xs text-white/40 truncate">{user?.role}</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
        </button>
      </div>
    </aside>
  )
}
