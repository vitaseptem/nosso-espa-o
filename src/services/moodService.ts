import { supabase } from '@/lib/supabase'
import type { MoodLog, MoodKind } from '@/types/database'
import { format, subDays } from 'date-fns'

export const moodService = {
  async logToday(userId: string, mood: MoodKind, note?: string): Promise<MoodLog> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data, error } = await supabase
      .from('mood_logs')
      .upsert({ user_id: userId, mood, note: note ?? null, log_date: today }, { onConflict: 'user_id,log_date' })
      .select('*, user:users!user_id(*)')
      .single()
    if (error || !data) throw error ?? new Error('Falha ao registrar humor')
    return data as MoodLog
  },

  async getForUser(userId: string, days = 30): Promise<MoodLog[]> {
    const since = format(subDays(new Date(), days), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('mood_logs')
      .select('*, user:users!user_id(*)')
      .eq('user_id', userId)
      .gte('log_date', since)
      .order('log_date', { ascending: false })
    return (data ?? []) as MoodLog[]
  },

  async getBoth(days = 30): Promise<MoodLog[]> {
    const since = format(subDays(new Date(), days), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('mood_logs')
      .select('*, user:users!user_id(*)')
      .gte('log_date', since)
      .order('log_date', { ascending: true })
    return (data ?? []) as MoodLog[]
  },

  async getTodayForBoth(): Promise<MoodLog[]> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('mood_logs')
      .select('*, user:users!user_id(*)')
      .eq('log_date', today)
    return (data ?? []) as MoodLog[]
  },
}
