import { motion } from 'framer-motion'
import { Heart, MapPin, Calendar, Trash2, Edit } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Memory } from '@/types/database'

interface MemoryCardProps {
  memory: Memory
  onToggleFavorite: (id: string, current: boolean) => void
  onDelete: (id: string) => void
  onEdit?: (memory: Memory) => void
}

export function MemoryCard({ memory, onToggleFavorite, onDelete, onEdit }: MemoryCardProps) {
  const coverPhoto = memory.media?.find(m => m.media_type === 'foto')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card hover className="overflow-hidden group">
        {coverPhoto?.url && (
          <div className="relative h-48 overflow-hidden">
            <img src={coverPhoto.url} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={() => onToggleFavorite(memory.id, memory.is_favorite)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
            >
              <Heart className={`w-4 h-4 ${memory.is_favorite ? 'fill-red-400 text-red-400' : 'text-white/60'}`} />
            </button>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-white line-clamp-1">{memory.title}</h3>
            {!coverPhoto && (
              <button onClick={() => onToggleFavorite(memory.id, memory.is_favorite)}>
                <Heart className={`w-4 h-4 shrink-0 ${memory.is_favorite ? 'fill-red-400 text-red-400' : 'text-white/30'}`} />
              </button>
            )}
          </div>
          {memory.description && (
            <p className="text-sm text-white/50 line-clamp-2 mb-3">{memory.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(memory.memory_date)}
            </span>
            {memory.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {memory.location}
              </span>
            )}
            {memory.media && memory.media.length > 0 && (
              <Badge variant="purple">{memory.media.length} arquivo{memory.media.length !== 1 ? 's' : ''}</Badge>
            )}
          </div>
          <div className="flex items-center justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(memory)}>
                <Edit className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={() => onDelete(memory.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
