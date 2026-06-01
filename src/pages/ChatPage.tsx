import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Phone } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ChatBubble } from '@/components/modules/chat/ChatBubble'
import { Avatar } from '@/components/ui/Avatar'
import { PageLoader } from '@/components/ui/Spinner'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'

export function ChatPage() {
  const { user, partner } = useAuthStore()
  const { messages, loading, loadMessages, sendMessage, markAllRead, subscribe, unsubscribe } = useChatStore()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    if (user) {
      markAllRead(user.id)
      subscribe(user.id)
    }
    return () => unsubscribe()
  }, [user, loadMessages, markAllRead, subscribe, unsubscribe])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !user) return
    const t = text.trim()
    setText('')
    await sendMessage(t, user.id)
  }

  if (loading) return <PageLoader />

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={partner?.display_name ?? 'Chat'}
        subtitle={partner?.is_online ? 'Online agora ✨' : 'Offline'}
        icon=""
        actions={
          <NavLink to="/chamada">
            <button className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          </NavLink>
        }
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-white/30 text-sm">
            Comecem a conversar... 💬
          </div>
        )}
        {messages.map(m => (
          <ChatBubble key={m.id} message={m} isMine={m.sender_id === user?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] px-4 py-3 flex items-end gap-3">
        <div className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-2xl px-4 py-2.5">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Digite uma mensagem..."
            rows={1}
            className="w-full bg-transparent text-white placeholder:text-white/30 resize-none focus:outline-none text-sm"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-violet to-nebula-purple flex items-center justify-center disabled:opacity-30 transition-opacity"
        >
          <Send className="w-4 h-4 text-white" />
        </motion.button>
      </div>
    </div>
  )
}
