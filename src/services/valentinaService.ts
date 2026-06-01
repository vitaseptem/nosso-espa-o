import { supabase, getStorageUrl, STORAGE_BUCKETS } from '@/lib/supabase'
import type { ValentinaMemory, ValentinaMedia, MediaType } from '@/types/database'

export const valentinaService = {
  async getAll(): Promise<ValentinaMemory[]> {
    const { data } = await supabase
      .from('valentina_memories')
      .select('*, author:users!author_id(*), media:valentina_media(*)')
      .order('memory_date', { ascending: false })
    if (!data) return []
    return resolveMedia(data as ValentinaMemory[])
  },

  async create(payload: {
    author_id: string
    title: string
    description?: string
    category: ValentinaMemory['category']
    memory_date: string
    age_years?: number
    age_months?: number
  }): Promise<ValentinaMemory> {
    const { data, error } = await supabase
      .from('valentina_memories')
      .insert({
        ...payload,
        description: payload.description ?? null,
        age_years: payload.age_years ?? null,
        age_months: payload.age_months ?? null,
      })
      .select('*, author:users!author_id(*)')
      .single()
    if (error || !data) throw error ?? new Error('Falha ao criar memória')
    return data as ValentinaMemory
  },

  async update(id: string, payload: Partial<ValentinaMemory>): Promise<void> {
    await supabase.from('valentina_memories').update(payload).eq('id', id)
  },

  async delete(id: string): Promise<void> {
    const { data: mediaList } = await supabase
      .from('valentina_media').select('storage_path').eq('memory_id', id)
    if (mediaList?.length) {
      await supabase.storage.from(STORAGE_BUCKETS.VALENTINA)
        .remove(mediaList.map(m => m.storage_path))
    }
    await supabase.from('valentina_memories').delete().eq('id', id)
  },

  async addMedia(memoryId: string, file: File, caption?: string): Promise<ValentinaMedia> {
    const ext = file.name.split('.').pop()
    const path = `valentina/${memoryId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.VALENTINA).upload(path, file)
    if (uploadError) throw uploadError

    const mediaType: MediaType = file.type.startsWith('image') ? 'foto'
      : file.type.startsWith('video') ? 'video' : 'audio'

    const { data, error } = await supabase.from('valentina_media').insert({
      memory_id: memoryId,
      storage_path: path,
      media_type: mediaType,
      caption: caption ?? null,
      size_bytes: file.size,
      sort_order: 0,
    }).select().single()
    if (error || !data) throw error ?? new Error('Falha ao salvar mídia')
    const url = await getStorageUrl(STORAGE_BUCKETS.VALENTINA, path)
    return { ...(data as ValentinaMedia), url }
  },

  async toggleFavorite(id: string, current: boolean): Promise<void> {
    await supabase.from('valentina_memories').update({ is_favorite: !current }).eq('id', id)
  },

  getStats(memories: ValentinaMemory[]) {
    const photos = memories.flatMap(m => m.media ?? []).filter(m => m.media_type === 'foto').length
    const videos = memories.flatMap(m => m.media ?? []).filter(m => m.media_type === 'video').length
    const favorites = memories.filter(m => m.is_favorite).length
    return { total: memories.length, photos, videos, favorites }
  },
}

async function resolveMedia(memories: ValentinaMemory[]): Promise<ValentinaMemory[]> {
  return Promise.all(memories.map(async (m) => {
    if (!m.media?.length) return m
    const media = await Promise.all(
      m.media.map(async item => ({ ...item, url: await getStorageUrl(STORAGE_BUCKETS.VALENTINA, item.storage_path) }))
    )
    return { ...m, media }
  }))
}
