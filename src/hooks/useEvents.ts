import { useState, useEffect, useCallback } from 'react'
import { eventsService } from '@/services/eventsService'
import { withTimeout } from '@/lib/utils'
import type { CalendarEvent } from '@/types/database'
import toast from 'react-hot-toast'

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setEvents(await withTimeout(eventsService.getAll()))
    } catch (err) {
      const msg = err instanceof Error && err.message.includes('timeout')
        ? 'Conexão lenta — tente novamente'
        : 'Erro ao carregar eventos'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const deleteEvent = useCallback(async (id: string) => {
    await eventsService.delete(id)
    setEvents(prev => prev.filter(e => e.id !== id))
    toast.success('Evento removido')
  }, [])

  return { events, loading, reload: load, deleteEvent }
}
