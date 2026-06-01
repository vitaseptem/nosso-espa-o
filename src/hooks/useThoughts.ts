import { useState, useEffect, useCallback } from 'react'
import { thoughtsService } from '@/services/thoughtsService'
import type { ThoughtGame } from '@/types/database'
import toast from 'react-hot-toast'

export function useThoughts() {
  const [thoughts, setThoughts] = useState<ThoughtGame[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { setThoughts(await thoughtsService.getAll()) }
    catch { toast.error('Erro ao carregar pensamentos') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const createThought = useCallback(async (authorId: string, secret: string, hint?: string) => {
    const newThought = await thoughtsService.create(authorId, secret, hint)
    setThoughts(prev => [newThought, ...prev])
    toast.success('Pensamento criado! 🧠')
    return newThought
  }, [])

  const submitGuess = useCallback(async (id: string, guess: string, secret: string, guesserId: string) => {
    const result = await thoughtsService.submitGuess(id, guess, secret, guesserId)
    setThoughts(prev => prev.map(t => t.id === id ? { ...t, guess, result } : t))
    if (result === 'acertou') toast.success('Acertou!! 🎉')
    else toast.error('Errou desta vez... 😅')
    return result
  }, [])

  const totalScore = thoughts.reduce((acc, t) => acc + t.points, 0)

  return { thoughts, loading, reload: load, createThought, submitGuess, totalScore }
}
