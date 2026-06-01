import { useState, useEffect, useCallback } from 'react'
import { memoriesService } from '@/services/memoriesService'
import type { Memory } from '@/types/database'
import toast from 'react-hot-toast'

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setMemories(await memoriesService.getAll()) }
    catch { toast.error('Erro ao carregar memórias') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const deleteMemory = useCallback(async (id: string) => {
    await memoriesService.delete(id)
    setMemories(prev => prev.filter(m => m.id !== id))
    toast.success('Memória removida')
  }, [])

  const toggleFavorite = useCallback(async (id: string, current: boolean) => {
    await memoriesService.toggleFavorite(id, current)
    setMemories(prev => prev.map(m => m.id === id ? { ...m, is_favorite: !current } : m))
  }, [])

  return { memories, loading, reload: load, deleteMemory, toggleFavorite }
}
