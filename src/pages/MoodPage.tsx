import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { PageLoader } from '@/components/ui/Spinner'
import { useMoods } from '@/hooks/useMoods'
import { useAuthStore } from '@/stores/authStore'
import { MOOD_EMOJIS, MOOD_LABELS, formatDate } from '@/lib/utils'
import type { MoodKind } from '@/types/database'

const moods: MoodKind[] = ['feliz', 'apaixonado', 'cansado', 'triste', 'irritado', 'animado', 'saudade']

export function MoodPage() {
  const { user, partner } = useAuthStore()
  const { logs, todayLogs, loading, logMood } = useMoods(user?.id)

  const myToday = todayLogs.find(l => l.user_id === user?.id)
  const partnerToday = todayLogs.find(l => l.user_id === partner?.id)

  const moodCounts = logs.reduce<Record<string, number>>((acc, l) => {
    if (l.user_id === user?.id) acc[l.mood] = (acc[l.mood] ?? 0) + 1
    return acc
  }, {})
  const maxCount = Math.max(...Object.values(moodCounts), 1)

  if (loading) return <PageLoader />

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Humor do Dia" subtitle="Como está o coração do casal?" icon="💖" />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
        {/* Partner status */}
        {partner && (
          <Card className="p-4 mb-6 flex items-center gap-4">
            <Avatar user={partner} size="md" showOnline />
            <div>
              <p className="text-sm font-medium text-white">{partner.display_name}</p>
              <p className="text-sm text-white/50">
                {partnerToday ? `${MOOD_EMOJIS[partnerToday.mood]} ${MOOD_LABELS[partnerToday.mood]}` : 'Ainda não registrou hoje'}
              </p>
            </div>
          </Card>
        )}

        {/* My mood selector */}
        <Card className="p-5 mb-6">
          <h2 className="font-semibold text-white mb-4">
            {myToday ? `Seu humor hoje: ${MOOD_EMOJIS[myToday.mood]} ${MOOD_LABELS[myToday.mood]}` : 'Como você está hoje?'}
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {moods.map(mood => (
              <motion.button
                key={mood}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => logMood(mood)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
                  myToday?.mood === mood
                    ? 'bg-nebula-purple/30 border-nebula-purple'
                    : 'border-white/10 hover:bg-white/[0.06]'
                }`}
              >
                <span className="text-2xl">{MOOD_EMOJIS[mood]}</span>
                <span className="text-[10px] text-white/50 text-center leading-tight">
                  {MOOD_LABELS[mood].split(' ').slice(1).join(' ')}
                </span>
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Chart */}
        {Object.keys(moodCounts).length > 0 && (
          <Card className="p-5">
            <h2 className="font-semibold text-white mb-4">Seu humor nos últimos 30 dias</h2>
            <div className="space-y-2.5">
              {moods.map(mood => {
                const count = moodCounts[mood] ?? 0
                if (count === 0) return null
                return (
                  <div key={mood} className="flex items-center gap-3">
                    <span className="text-lg w-6">{MOOD_EMOJIS[mood]}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxCount) * 100}%` }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="h-full rounded-full bg-gradient-to-r from-nebula-purple to-nebula-pink"
                      />
                    </div>
                    <span className="text-xs text-white/40 w-5 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
