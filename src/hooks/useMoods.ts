import { useState, useEffect, useCallback } from 'react'
import { moodService } from '@/services/moodService'
import type { MoodLog, MoodKind } from '@/types/database'
import toast from 'react-hot-toast'

export function useMoods(userId: string | undefined, days = 30) {
  const [logs, setLogs] = useState<MoodLog[]>([])
  const [todayLogs, setTodayLogs] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [all, today] = await Promise.all([
        moodService.getBoth(days),
        moodService.getTodayForBoth(),
      ])
      setLogs(all)
      setTodayLogs(today)
    } catch { toast.error('Erro ao carregar humor') }
    finally { setLoading(false) }
  }, [userId, days])

  useEffect(() => { load() }, [load])

  const logMood = useCallback(async (mood: MoodKind, note?: string) => {
    if (!userId) return
    const newLog = await moodService.logToday(userId, mood, note)
    setTodayLogs(prev => {
      const filtered = prev.filter(l => l.user_id !== userId)
      return [...filtered, newLog]
    })
    toast.success('Humor registrado! 💫')
  }, [userId])

  return { logs, todayLogs, loading, reload: load, logMood }
}
