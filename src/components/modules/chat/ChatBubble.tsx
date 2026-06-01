import { motion } from 'framer-motion'
import { cn, formatDate } from '@/lib/utils'
import type { Message } from '@/types/database'

interface ChatBubbleProps {
  message: Message
  isMine: boolean
}

export function ChatBubble({ message, isMine }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2 max-w-[80%]', isMine ? 'ml-auto flex-row-reverse' : 'mr-auto')}
    >
      <div className={cn(
        'rounded-2xl px-4 py-2.5 text-sm shadow-md',
        isMine
          ? 'bg-gradient-to-br from-nebula-violet to-nebula-purple text-white rounded-tr-sm'
          : 'bg-white/[0.08] text-white border border-white/[0.08] rounded-tl-sm'
      )}>
        {message.message_type === 'imagem' && message.media_url && (
          <img src={message.media_url} alt="imagem" className="max-w-[240px] rounded-xl mb-2 object-cover" />
        )}
        {message.content && <p className="leading-relaxed">{message.content}</p>}
        <p className={cn('text-[10px] mt-1', isMine ? 'text-white/50' : 'text-white/30')}>
          {formatDate(message.created_at, 'HH:mm')}
          {isMine && <span className="ml-1">{message.is_read ? '✓✓' : '✓'}</span>}
        </p>
      </div>
    </motion.div>
  )
}
