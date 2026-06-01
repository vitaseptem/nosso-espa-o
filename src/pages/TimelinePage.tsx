import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Filter } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { MemoryCard } from '@/components/modules/memories/MemoryCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PageLoader, Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useMemories } from '@/hooks/useMemories'
import { memoriesService } from '@/services/memoriesService'
import { useAuthStore } from '@/stores/authStore'
import { format } from 'date-fns'
import { parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import type { Memory } from '@/types/database'

const categoryOptions = [
  { value: 'outro', label: '📌 Outro' },
  { value: 'foto', label: '📷 Foto' },
  { value: 'video', label: '🎥 Vídeo' },
  { value: 'data', label: '📅 Data especial' },
  { value: 'viagem', label: '✈️ Viagem' },
  { value: 'evento', label: '🎉 Evento' },
]

export function TimelinePage() {
  const { user } = useAuthStore()
  const { memories, loading, reload, deleteMemory, toggleFavorite } = useMemories()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', memory_date: format(new Date(), 'yyyy-MM-dd'), location: '', category: 'outro' as Memory['category'] })
  const [files, setFiles] = useState<File[]>([])

  const grouped = memories.reduce<Record<string, Memory[]>>((acc, m) => {
    const year = m.memory_date.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(m)
    return acc
  }, {})

  const handleSave = async () => {
    if (!form.title || !user) return
    setSaving(true)
    try {
      const created = await memoriesService.create({ ...form, author_id: user.id, description: form.description || undefined, location: form.location || undefined })
      for (const f of files) await memoriesService.addMedia(created.id, f)
      toast.success('Memória criada! ⭐')
      setShowForm(false)
      setForm({ title: '', description: '', memory_date: format(new Date(), 'yyyy-MM-dd'), location: '', category: 'outro' })
      setFiles([])
      await reload()
    } catch { toast.error('Erro ao salvar memória') }
    finally { setSaving(false) }
  }

  if (loading) return <PageLoader />

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Linha do Tempo"
        subtitle={`${memories.length} memórias`}
        icon="⏳"
        actions={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Nova memória
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {memories.length === 0 ? (
          <EmptyState icon="⭐" title="Nenhuma memória ainda" description="Comece a registrar os momentos especiais de vocês dois." action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Criar primeira memória</Button>} />
        ) : (
          Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([year, mems]) => (
            <div key={year} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="font-display text-2xl font-bold text-white/20">{year}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-white/30">{mems.length} memórias</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {mems.map(m => (
                    <MemoryCard key={m.id} memory={m} onToggleFavorite={toggleFavorite} onDelete={deleteMemory} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova memória" size="lg">
        <div className="space-y-4">
          <Input label="Título *" placeholder="Nome desta memória" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Textarea label="Descrição" placeholder="Conta o que aconteceu..." rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data *" type="date" value={form.memory_date} onChange={e => setForm(p => ({ ...p, memory_date: e.target.value }))} />
            <Select label="Categoria" options={categoryOptions} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as Memory['category'] }))} />
          </div>
          <Input label="Local (opcional)" placeholder="Ex: Praia de Copacabana" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
          <div>
            <label className="text-sm font-medium text-white/70 block mb-1.5">Fotos / vídeos</label>
            <input type="file" multiple accept="image/*,video/*" onChange={e => setFiles(Array.from(e.target.files ?? []))} className="text-sm text-white/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-nebula-purple/20 file:text-nebula-purple hover:file:bg-nebula-purple/30 file:cursor-pointer" />
            {files.length > 0 && <p className="text-xs text-white/40 mt-1">{files.length} arquivo(s) selecionado(s)</p>}
          </div>
          <Button onClick={handleSave} loading={saving} size="lg" className="w-full">Salvar memória ✨</Button>
        </div>
      </Modal>
    </div>
  )
}
