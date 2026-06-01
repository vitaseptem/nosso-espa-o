import { useState, useEffect, useCallback } from 'react'
import { valentinaService } from '@/services/valentinaService'
import type { ValentinaMemory } from '@/types/database'
import toast from 'react-hot-toast'

export function useValentina() {
  const [memories, setMemories] = useState<ValentinaMemory[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setMemories(await valentinaService.getAll()) }
    catch { toast.error('Erro ao carregar memórias da Valentina') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const deleteMemory = useCallback(async (id: string) => {
    await valentinaService.delete(id)
    setMemories(prev => prev.filter(m => m.id !== id))
    toast.success('Memória removida')
  }, [])

  const toggleFavorite = useCallback(async (id: string, current: boolean) => {
    await valentinaService.toggleFavorite(id, current)
    setMemories(prev => prev.map(m => m.id === id ? { ...m, is_favorite: !current } : m))
  }, [])

  const stats = valentinaService.getStats(memories)

  return { memories, loading, reload: load, deleteMemory, toggleFavorite, stats }
}
