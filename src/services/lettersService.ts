import { supabase } from '@/lib/supabase'
import type { FutureLetter } from '@/types/database'
import { format } from 'date-fns'

export const lettersService = {
  async getAll(): Promise<FutureLetter[]> {
    const { data } = await supabase
      .from('future_letters')
      .select('*, author:users!author_id(*)')
      .order('open_date', { ascending: true })
    return (data ?? []) as FutureLetter[]
  },

  async create(payload: {
    author_id: string
    recipient_id?: string
    title: string
    content: string
    open_date: string
  }): Promise<FutureLetter> {
    const { data, error } = await supabase
      .from('future_letters')
      .insert({ ...payload, recipient_id: payload.recipient_id ?? null })
      .select('*, author:users!author_id(*)')
      .single()
    if (error || !data) throw error ?? new Error('Falha ao criar carta')
    return data as FutureLetter
  },

  async markOpened(id: string): Promise<void> {
    await supabase.from('future_letters').update({
      is_opened: true,
      opened_at: new Date().toISOString(),
    }).eq('id', id)
  },

  async delete(id: string): Promise<void> {
    await supabase.from('future_letters').delete().eq('id', id)
  },

  isUnlocked(letter: FutureLetter): boolean {
    return new Date() >= new Date(letter.open_date)
  },

  daysUntilUnlock(letter: FutureLetter): number {
    const diff = new Date(letter.open_date).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 86400000))
  },
}
