import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Heart, Star, Calendar, Clock, Image, Smile } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { eventsService } from '@/services/eventsService'
import { memoriesService } from '@/services/memoriesService'
import { moodService } from '@/services/moodService'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import {
  calculateTimeTogetherFromString, formatRelativeDate,
  getNextOccurrence, daysUntil, MOOD_EMOJIS, EVENT_TYPE_LABELS
} from '@/lib/utils'
import type { CalendarEvent, Memory, MoodLog } from '@/types/database'
import { NavLink } from 'react-router-dom'

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
}

export function DashboardPage() {
  const { user, partner, settings } = useAuthStore()
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [recentMemories, setRecentMemories] = useState<Memory[]>([])
  const [todayMoods, setTodayMoods] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)

  const timeTogether = calculateTimeTogetherFromString(settings?.relationship_start_date ?? null)
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  useEffect(() => {
    const load = async () => {
      try {
        const [events, memories, moods] = await Promise.all([
          eventsService.getUpcoming(4),
          memoriesService.getAll().then(m => m.slice(0, 4)),
          moodService.getTodayForBoth(),
        ])
        setUpcomingEvents(events)
        setRecentMemories(memories)
        setTodayMoods(moods)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const myMood = todayMoods.find(m => m.user_id === user?.id)
  const partnerMood = todayMoods.find(m => m.user_id === partner?.id)

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      {/* Header greeting */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <p className="text-white/40 text-sm capitalize">{today}</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
          Olá, {user?.display_name} 🌟
        </h1>
      </motion.div>

      {/* Couple header card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card glow="purple" className="p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-nebula-purple/10 to-nebula-pink/10 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Couple avatars */}
            <div className="flex items-center gap-3">
              <Avatar user={user} size="lg" showOnline />
              <Heart className="w-5 h-5 text-nebula-pink animate-pulse" />
              <Avatar user={partner} size="lg" showOnline />
            </div>
            {/* Counters */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 flex-1">
              {[
                { value: timeTogether.days, label: 'dias juntos', icon: '💕' },
                { value: `${timeTogether.years}a ${timeTogether.months}m`, label: 'de amor', icon: '🌙' },
              ].map((item, i) => (
                <motion.div key={i} custom={i} variants={statCardVariants} initial="hidden" animate="visible"
                  className="text-center bg-white/[0.06] rounded-2xl px-5 py-3">
                  <div className="text-2xl font-bold text-white font-display">{item.icon} {item.value}</div>
                  <div className="text-xs text-white/40">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          {/* Moods */}
          <div className="relative flex gap-4 mt-4">
            {[{ user, mood: myMood }, { user: partner, mood: partnerMood }].map(({ user: u, mood: m }) => (
              u && (
                <div key={u.id} className="flex items-center gap-2 text-sm text-white/50">
                  <span>{m ? MOOD_EMOJIS[m.mood] : '—'}</span>
                  <span>{u.display_name}</span>
                </div>
              )
            ))}
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming events */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-nebula-purple" /> Próximas datas
              </h2>
              <NavLink to="/calendario" className="text-xs text-nebula-purple hover:text-nebula-pink">Ver todas</NavLink>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-4">Nenhum evento próximo</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(ev => {
                  const next = getNextOccurrence(ev.event_date, ev.is_recurring)
                  const days = daysUntil(next)
                  return (
                    <div key={ev.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-nebula-purple/20 flex items-center justify-center text-lg shrink-0">
                        {ev.event_type === 'aniversario' ? '🎂' : ev.event_type === 'casamento' ? '💍' : ev.event_type === 'viagem' ? '✈️' : '📅'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{ev.title}</p>
                        <p className="text-xs text-white/40">{formatRelativeDate(next.toISOString())}</p>
                      </div>
                      <Badge variant={days === 0 ? 'pink' : days <= 7 ? 'purple' : 'gray'}>
                        {days === 0 ? 'Hoje!' : `${days}d`}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recent memories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-nebula-pink" /> Memórias recentes
              </h2>
              <NavLink to="/timeline" className="text-xs text-nebula-purple hover:text-nebula-pink">Ver todas</NavLink>
            </div>
            {recentMemories.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-4">Nenhuma memória ainda</p>
            ) : (
              <div className="space-y-3">
                {recentMemories.map(m => {
                  const cover = m.media?.find(x => x.media_type === 'foto')
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-nebula-purple/10">
                        {cover?.url ? <img src={cover.url} alt={m.title} className="w-full h-full object-cover" /> : <Image className="w-5 h-5 m-auto mt-2.5 text-nebula-purple/40" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{m.title}</p>
                        <p className="text-xs text-white/40">{formatRelativeDate(m.memory_date)}</p>
                      </div>
                      {m.is_favorite && <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400 shrink-0" />}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6">
        <h2 className="text-sm font-medium text-white/40 mb-3">Acesso rápido</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { to: '/chat',        icon: '💬', label: 'Chat' },
            { to: '/humor',       icon: '😊', label: 'Humor' },
            { to: '/pensamentos', icon: '🧠', label: 'Pensar' },
            { to: '/cartas',      icon: '💌', label: 'Cartas' },
            { to: '/universo',    icon: '🌌', label: 'Universo' },
            { to: '/valentina',   icon: '👧', label: 'Valentina' },
          ].map(item => (
            <NavLink key={item.to} to={item.to}>
              <Card hover className="p-3 text-center flex flex-col items-center gap-1.5">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-white/50">{item.label}</span>
              </Card>
            </NavLink>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
