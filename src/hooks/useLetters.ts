import { useState, useEffect, useCallback } from 'react'
import { lettersService } from '@/services/lettersService'
import type { FutureLetter } from '@/types/database'
import toast from 'react-hot-toast'

export function useLetters() {
  const [letters, setLetters] = useState<FutureLetter[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setLetters(await lettersService.getAll()) }
    catch { toast.error('Erro ao carregar cartas') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const deleteLetter = useCallback(async (id: string) => {
    await lettersService.delete(id)
    setLetters(prev => prev.filter(l => l.id !== id))
    toast.success('Carta removida')
  }, [])

  const markOpened = useCallback(async (id: string) => {
    await lettersService.markOpened(id)
    setLetters(prev => prev.map(l => l.id === id ? { ...l, is_opened: true } : l))
  }, [])

  return { letters, loading, reload: load, deleteLetter, markOpened }
}
