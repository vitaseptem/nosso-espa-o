import { motion } from 'framer-motion'
import { Heart, Calendar, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, VALENTINA_CATEGORY_LABELS } from '@/lib/utils'
import type { ValentinaMemory } from '@/types/database'

interface ValentinaCardProps {
  memory: ValentinaMemory
  onToggleFavorite: (id: string, current: boolean) => void
  onDelete: (id: string) => void
}

export function ValentinaCard({ memory, onToggleFavorite, onDelete }: ValentinaCardProps) {
  const coverPhoto = memory.media?.find(m => m.media_type === 'foto')
  const ageLabel = memory.age_years != null
    ? memory.age_years === 0
      ? `${memory.age_months ?? 0} meses`
      : `${memory.age_years} ano${memory.age_years !== 1 ? 's' : ''}`
    : null

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card hover className="overflow-hidden group">
        {coverPhoto?.url && (
          <div className="relative h-44 overflow-hidden">
            <img src={coverPhoto.url} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-white line-clamp-1 flex-1">{memory.title}</h3>
            <button onClick={() => onToggleFavorite(memory.id, memory.is_favorite)}>
              <Heart className={`w-4 h-4 shrink-0 ${memory.is_favorite ? 'fill-red-400 text-red-400' : 'text-white/30'}`} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge variant="pink">{VALENTINA_CATEGORY_LABELS[memory.category]}</Badge>
            {ageLabel && <Badge variant="purple">{ageLabel}</Badge>}
          </div>
          {memory.description && (
            <p className="text-sm text-white/50 line-clamp-2 mb-2">{memory.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Calendar className="w-3 h-3" />{formatDate(memory.memory_date)}
            </span>
            <Button variant="danger" size="sm" onClick={() => onDelete(memory.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
