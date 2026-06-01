import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Heart, Camera, Video } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ValentinaCard } from '@/components/modules/valentina/ValentinaCard'
import { useValentina } from '@/hooks/useValentina'
import { valentinaService } from '@/services/valentinaService'
import { useAuthStore } from '@/stores/authStore'
import { calculateAge, VALENTINA_CATEGORY_LABELS } from '@/lib/utils'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import type { ValentinaMemory } from '@/types/database'

const categoryOptions = Object.entries(VALENTINA_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))

export function ValentinaPage() {
  const { user, settings } = useAuthStore()
  const { memories, loading, reload, deleteMemory, toggleFavorite, stats } = useValentina()
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState<string>('todos')
  const [form, setForm] = useState({
    title: '', description: '', category: 'momentos_especiais' as ValentinaMemory['category'],
    memory_date: format(new Date(), 'yyyy-MM-dd'), age_years: '', age_months: ''
  })
  const [files, setFiles] = useState<File[]>([])

  const valentina = settings?.valentina_name ?? 'Valentina'
  const age = calculateAge(settings?.valentina_birth_date ?? null)

  const filtered = filterCat === 'todos' ? memories : memories.filter(m => m.category === filterCat)
  const grouped = filtered.reduce<Record<string, ValentinaMemory[]>>((acc, m) => {
    const year = m.memory_date.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(m)
    return acc
  }, {})

  const handleSave = async () => {
    if (!user || !form.title) return
    setSaving(true)
    try {
      const created = await valentinaService.create({
        author_id: user.id, title: form.title, description: form.description || undefined,
        category: form.category, memory_date: form.memory_date,
        age_years: form.age_years ? Number(form.age_years) : undefined,
        age_months: form.age_months ? Number(form.age_months) : undefined,
      })
      for (const f of files) await valentinaService.addMedia(created.id, f)
      toast.success(`Memória da ${valentina} salva! 💖`)
      setShowForm(false)
      setForm({ title: '', description: '', category: 'momentos_especiais', memory_date: format(new Date(), 'yyyy-MM-dd'), age_years: '', age_months: '' })
      setFiles([])
      reload()
    } catch { toast.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  if (loading) return <PageLoader />

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={`Cantinho da ${valentina}`} subtitle="A história dela ❤️" icon="👧"
        actions={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Nova memória</Button>}
      />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: '🌟', value: stats.total, label: 'Memórias' },
            { icon: '📷', value: stats.photos, label: 'Fotos' },
            { icon: '🎥', value: stats.videos, label: 'Vídeos' },
            { icon: '🎂', value: `${age.years}a ${age.months}m`, label: 'Idade' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-display text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <Button size="sm" variant={filterCat === 'todos' ? 'primary' : 'secondary'} onClick={() => setFilterCat('todos')}>Todos</Button>
          {Object.entries(VALENTINA_CATEGORY_LABELS).map(([value, label]) => (
            <Button key={value} size="sm" variant={filterCat === value ? 'primary' : 'secondary'} onClick={() => setFilterCat(value)} className="whitespace-nowrap">{label}</Button>
          ))}
        </div>

        {memories.length === 0 ? (
          <EmptyState icon="👧" title={`Nenhuma memória da ${valentina} ainda`} description="Comece a registrar os momentos especiais dela." action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Criar primeira memória</Button>} />
        ) : (
          Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([year, mems]) => (
            <div key={year} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-display text-2xl font-bold text-nebula-pink/40">{year}</span>
                <div className="flex-1 h-px bg-nebula-pink/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {mems.map(m => (
                  <ValentinaCard key={m.id} memory={m} onToggleFavorite={toggleFavorite} onDelete={deleteMemory} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={`Nova memória da ${valentina}`} size="lg">
        <div className="space-y-4">
          <Input label="Título *" placeholder="Descreva este momento" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Select label="Categoria" options={categoryOptions} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as ValentinaMemory['category'] }))} />
          <Textarea label="Descrição" placeholder="Conta como foi..." rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <Input label="Data *" type="date" value={form.memory_date} onChange={e => setForm(p => ({ ...p, memory_date: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Idade (anos)" type="number" min="0" max="30" placeholder="0" value={form.age_years} onChange={e => setForm(p => ({ ...p, age_years: e.target.value }))} />
            <Input label="Idade (meses)" type="number" min="0" max="11" placeholder="0" value={form.age_months} onChange={e => setForm(p => ({ ...p, age_months: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-white/70 block mb-1.5">Fotos / vídeos</label>
            <input type="file" multiple accept="image/*,video/*" onChange={e => setFiles(Array.from(e.target.files ?? []))} className="text-sm text-white/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-nebula-pink/20 file:text-nebula-pink hover:file:bg-nebula-pink/30 file:cursor-pointer" />
            {files.length > 0 && <p className="text-xs text-white/40 mt-1">{files.length} arquivo(s)</p>}
          </div>
          <Button onClick={handleSave} loading={saving} size="lg" className="w-full">Salvar memória 💖</Button>
        </div>
      </Modal>
    </div>
  )
}
