import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e ANON KEY são obrigatórios. Verifique o arquivo .env')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  }
})

export const ALLOWED_EMAILS = [
  (import.meta.env.VITE_HUSBAND_EMAIL as string) || '',
  (import.meta.env.VITE_WIFE_EMAIL as string) || '',
].filter(Boolean)

export const STORAGE_BUCKETS = {
  MEMORIES:  'memories',
  VALENTINA: 'valentina',
  CHAT:      'chat',
  AVATARS:   'avatars',
} as const

export async function getStorageUrl(bucket: string, path: string): Promise<string> {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600)
  return data?.signedUrl ?? ''
}
