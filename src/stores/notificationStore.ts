import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  channel: RealtimeChannel | null

  load: (userId: string) => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: (userId: string) => Promise<void>
  subscribe: (userId: string) => void
  unsubscribe: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  channel: null,

  load: async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    const notifs = (data ?? []) as Notification[]
    set({ notifications: notifs, unreadCount: notifs.filter(n => !n.is_read).length })
  },

  markRead: async (id) => {
    await supabase.from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
    set(state => {
      const updated = state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
      return { notifications: updated, unreadCount: updated.filter(n => !n.is_read).length }
    })
  },

  markAllRead: async (userId) => {
    await supabase.from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId).eq('is_read', false)
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },

  subscribe: (userId) => {
    const existing = get().channel
    if (existing) existing.unsubscribe()

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const n = payload.new as Notification
        set(state => ({
          notifications: [n, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      })
      .subscribe()

    set({ channel })
  },

  unsubscribe: () => {
    const { channel } = get()
    if (channel) channel.unsubscribe()
    set({ channel: null })
  },
}))
