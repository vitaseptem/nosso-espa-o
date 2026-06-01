import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User, AppSettings } from '@/types/database'

interface AuthState {
  user: User | null
  partner: User | null
  settings: AppSettings | null
  loading: boolean
  initialized: boolean

  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  updateSettings: (data: Partial<AppSettings>) => Promise<void>
  setOnline: (online: boolean) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  partner: null,
  settings: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    set({ loading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserData(session.user.id, set)
      }
    } finally {
      set({ loading: false, initialized: true })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user.id, set)
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, partner: null, settings: null })
      }
    })
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    const { user } = get()
    if (user) {
      await supabase.from('users').update({ is_online: false }).eq('id', user.id)
    }
    await supabase.auth.signOut()
    set({ user: null, partner: null, settings: null })
  },

  updateProfile: async (data) => {
    const { user } = get()
    if (!user) return
    const { data: updated } = await supabase
      .from('users').update(data).eq('id', user.id).select().single()
    if (updated) set({ user: updated as User })
  },

  updateSettings: async (data) => {
    const { data: updated } = await supabase
      .from('app_settings').update(data).eq('id', 1).select().single()
    if (updated) set({ settings: updated as AppSettings })
  },

  setOnline: async (online) => {
    const { user } = get()
    if (!user) return
    await supabase.from('users').update({
      is_online: online,
      last_seen_at: online ? null : new Date().toISOString(),
    }).eq('id', user.id)
    set({ user: { ...user, is_online: online } })
  },
}))

async function loadUserData(
  userId: string,
  set: (state: Partial<AuthState>) => void
) {
  const [usersResult, settingsResult] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('app_settings').select('*').eq('id', 1).single(),
  ])

  const users = (usersResult.data ?? []) as User[]
  const me = users.find(u => u.id === userId) ?? null
  const partner = users.find(u => u.id !== userId) ?? null
  const settings = settingsResult.data as AppSettings | null

  if (me) {
    await supabase.from('users').update({ is_online: true }).eq('id', userId)
  }

  set({ user: me ? { ...me, is_online: true } : null, partner, settings })
}
