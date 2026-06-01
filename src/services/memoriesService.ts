import { supabase, getStorageUrl, STORAGE_BUCKETS } from '@/lib/supabase'
import type { Memory, MemoryMedia, MediaType } from '@/types/database'

export const memoriesService = {
  async getAll(): Promise<Memory[]> {
    const { data } = await supabase
      .from('memories')
      .select('*, author:users!author_id(*), media:memory_media(*)')
      .order('memory_date', { ascending: false })
    if (!data) return []
    return resolveMediaUrls(data as Memory[], STORAGE_BUCKETS.MEMORIES)
  },

  async getById(id: string): Promise<Memory | null> {
    const { data } = await supabase
      .from('memories')
      .select('*, author:users!author_id(*), media:memory_media(*)')
      .eq('id', id)
      .single()
    if (!data) return null
    const [resolved] = await resolveMediaUrls([data as Memory], STORAGE_BUCKETS.MEMORIES)
    return resolved
  },

  async create(payload: {
    title: string
    description?: string
    memory_date: string
    location?: string
    category: Memory['category']
    author_id: string
  }): Promise<Memory> {
    const { data, error } = await supabase
      .from('memories')
      .insert(payload)
      .select('*, author:users!author_id(*)')
      .single()
    if (error || !data) throw error ?? new Error('Falha ao criar memória')
    return data as Memory
  },

  async update(id: string, payload: Partial<Memory>): Promise<void> {
    await supabase.from('memories').update(payload).eq('id', id)
  },

  async delete(id: string): Promise<void> {
    // cascade deletes memory_media; we also remove storage files
    const { data: mediaList } = await supabase
      .from('memory_media').select('storage_path').eq('memory_id', id)
    if (mediaList?.length) {
      await supabase.storage.from(STORAGE_BUCKETS.MEMORIES)
        .remove(mediaList.map(m => m.storage_path))
    }
    await supabase.from('memories').delete().eq('id', id)
  },

  async addMedia(memoryId: string, file: File, caption?: string): Promise<MemoryMedia> {
    const ext = file.name.split('.').pop()
    const path = `memories/${memoryId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.MEMORIES).upload(path, file, { upsert: false })
    if (uploadError) throw uploadError

    const mediaType: MediaType = file.type.startsWith('image') ? 'foto'
      : file.type.startsWith('video') ? 'video' : 'audio'

    const { data, error } = await supabase.from('memory_media').insert({
      memory_id: memoryId,
      storage_path: path,
      media_type: mediaType,
      caption: caption ?? null,
      size_bytes: file.size,
      sort_order: 0,
    }).select().single()
    if (error || !data) throw error ?? new Error('Falha ao salvar mídia')
    const url = await getStorageUrl(STORAGE_BUCKETS.MEMORIES, path)
    return { ...(data as MemoryMedia), url }
  },

  async deleteMedia(media: MemoryMedia): Promise<void> {
    await supabase.storage.from(STORAGE_BUCKETS.MEMORIES).remove([media.storage_path])
    await supabase.from('memory_media').delete().eq('id', media.id)
  },

  async toggleFavorite(id: string, current: boolean): Promise<void> {
    await supabase.from('memories').update({ is_favorite: !current }).eq('id', id)
  },
}

async function resolveMediaUrls(memories: Memory[], bucket: string): Promise<Memory[]> {
  return Promise.all(
    memories.map(async (m) => {
      if (!m.media?.length) return m
      const media = await Promise.all(
        m.media.map(async (item) => ({
          ...item,
          url: await getStorageUrl(bucket, item.storage_path),
        }))
      )
      return { ...m, media }
    })
  )
}
