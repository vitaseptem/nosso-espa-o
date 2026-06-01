import { supabase } from '@/lib/supabase'
import type { CalendarEvent } from '@/types/database'
import { parseISO, isAfter } from 'date-fns'
import { getNextOccurrence } from '@/lib/utils'

export const eventsService = {
  async getAll(): Promise<CalendarEvent[]> {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
    return (data ?? []) as CalendarEvent[]
  },

  async getUpcoming(limit = 5): Promise<CalendarEvent[]> {
    const all = await eventsService.getAll()
    const now = new Date()
    return all
      .map(e => ({ e, next: getNextOccurrence(e.event_date, e.is_recurring) }))
      .filter(({ next }) => isAfter(next, now))
      .sort((a, b) => a.next.getTime() - b.next.getTime())
      .slice(0, limit)
      .map(({ e }) => e)
  },

  async create(payload: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    const { data, error } = await supabase.from('events').insert(payload).select().single()
    if (error || !data) throw error ?? new Error('Falha ao criar evento')
    return data as CalendarEvent
  },

  async update(id: string, payload: Partial<CalendarEvent>): Promise<void> {
    await supabase.from('events').update(payload).eq('id', id)
  },

  async delete(id: string): Promise<void> {
    await supabase.from('events').delete().eq('id', id)
  },
}
