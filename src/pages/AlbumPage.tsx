import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useMemories } from '@/hooks/useMemories'
import type { MemoryMedia } from '@/types/database'

export function AlbumPage() {
  const { memories, loading } = useMemories()
  const [lightbox, setLightbox] = useState<{ index: number; items: MemoryMedia[] } | null>(null)
  const [filter, setFilter] = useState<'todos' | 'foto' | 'video'>('todos')

  const allMedia = useMemo(() => {
    return memories
      .flatMap(m => (m.media ?? []).map(item => ({ ...item, memoryTitle: m.title })))
      .filter(item => filter === 'todos' || item.media_type === filter)
  }, [memories, filter])

  const openLightbox = (index: number) => setLightbox({ index, items: allMedia })
  const prev = () => setLightbox(l => l ? { ...l, index: Math.max(0, l.index - 1) } : l)
  const next = () => setLightbox(l => l ? { ...l, index: Math.min(l.items.length - 1, l.index + 1) } : l)

  if (loading) return <PageLoader />

  const current = lightbox ? lightbox.items[lightbox.index] : null

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Álbum de Memórias" subtitle={`${allMedia.length} arquivos`} icon="📷"
        actions={
          <div className="flex gap-1.5">
            {(['todos', 'foto', 'video'] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'primary' : 'secondary'} onClick={() => setFilter(f)}>
                {f === 'todos' ? 'Todos' : f === 'foto' ? 'Fotos' : 'Vídeos'}
              </Button>
            ))}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {allMedia.length === 0 ? (
          <EmptyState icon="📷" title="Nenhuma mídia ainda" description="Adicione fotos e vídeos às suas memórias." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {allMedia.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-white/[0.04]"
                onClick={() => openLightbox(i)}>
                {item.media_type === 'foto' && item.url && (
                  <img src={item.url} alt={item.caption ?? ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                )}
                {item.media_type === 'video' && (
                  <div className="w-full h-full flex items-center justify-center bg-nebula-purple/10">
                    <span className="text-3xl">🎥</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && current && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(null)}>
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/60 hover:text-white z-10 p-2">
              <X className="w-6 h-6" />
            </button>
            <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10 p-2" disabled={lightbox.index === 0}>
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button onClick={e => { e.stopPropagation(); next() }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10 p-2" disabled={lightbox.index === lightbox.items.length - 1}>
              <ChevronRight className="w-8 h-8" />
            </button>
            <motion.div key={current.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-w-4xl max-h-[85vh] px-16" onClick={e => e.stopPropagation()}>
              {current.media_type === 'foto' && current.url && (
                <img src={current.url} alt={current.caption ?? ''} className="max-h-[80vh] max-w-full object-contain rounded-xl" />
              )}
              {current.media_type === 'video' && current.url && (
                <video src={current.url} controls className="max-h-[80vh] max-w-full rounded-xl" />
              )}
            </motion.div>
            <div className="absolute bottom-6 text-center text-white/50 text-sm">
              {lightbox.index + 1} / {lightbox.items.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
