import { supabase } from '@/lib/supabase'
import type { ThoughtGame } from '@/types/database'

type ThoughtResult = 'acertou' | 'errou'

export const thoughtsService = {
  async getAll(): Promise<ThoughtGame[]> {
    const { data } = await supabase
      .from('thoughts_game')
      .select('*, author:users!author_id(*), guesser:users!guesser_id(*)')
      .order('created_at', { ascending: false })
    return (data ?? []) as ThoughtGame[]
  },

  async create(authorId: string, secretAnswer: string, hint?: string): Promise<ThoughtGame> {
    const { data, error } = await supabase
      .from('thoughts_game')
      .insert({
        author_id: authorId,
        secret_answer: secretAnswer,
        hint: hint ?? null,
        result: 'pendente',
        points: 0,
      })
      .select('*, author:users!author_id(*)')
      .single()
    if (error || !data) throw error ?? new Error('Falha ao criar pensamento')
    return data as ThoughtGame
  },

  async submitGuess(id: string, guess: string, secretAnswer: string, guesserId: string): Promise<ThoughtResult> {
    const correct = guess.trim().toLowerCase() === secretAnswer.trim().toLowerCase()
    const result: ThoughtResult = correct ? 'acertou' : 'errou'
    await supabase.from('thoughts_game').update({
      guess,
      guesser_id: guesserId,
      result,
      points: correct ? 10 : 0,
      answered_at: new Date().toISOString(),
    }).eq('id', id)
    return result
  },

  async delete(id: string): Promise<void> {
    await supabase.from('thoughts_game').delete().eq('id', id)
  },
}
