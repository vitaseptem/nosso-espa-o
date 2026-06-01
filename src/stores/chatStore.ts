import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Message } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface ChatState {
  messages: Message[]
  loading: boolean
  channel: RealtimeChannel | null

  loadMessages: () => Promise<void>
  sendMessage: (content: string, senderId: string) => Promise<void>
  markAllRead: (userId: string) => Promise<void>
  subscribe: (currentUserId: string) => void
  unsubscribe: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  channel: null,

  loadMessages: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(*)')
      .order('created_at', { ascending: true })
      .limit(200)
    set({ messages: (data ?? []) as Message[], loading: false })
  },

  sendMessage: async (content, senderId) => {
    await supabase.from('messages').insert({
      content,
      sender_id: senderId,
      message_type: 'texto',
    })
  },

  markAllRead: async (userId) => {
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .neq('sender_id', userId)
      .eq('is_read', false)
    set(state => ({
      messages: state.messages.map(m =>
        m.sender_id !== userId ? { ...m, is_read: true } : m
      )
    }))
  },

  subscribe: (currentUserId) => {
    const existing = get().channel
    if (existing) existing.unsubscribe()

    const channel = supabase
      .channel('chat-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, async (payload) => {
        const newMsg = payload.new as Message
        const { data: sender } = await supabase
          .from('users').select('*').eq('id', newMsg.sender_id).single()
        const msgWithSender = { ...newMsg, sender: sender ?? undefined } as Message

        set(state => ({ messages: [...state.messages, msgWithSender] }))

        if (newMsg.sender_id !== currentUserId) {
          await supabase.from('messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', newMsg.id)
        }
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
