import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Lock, Unlock, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useLetters } from '@/hooks/useLetters'
import { lettersService } from '@/services/lettersService'
import { useAuthStore } from '@/stores/authStore'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function LettersPage() {
  const { user } = useAuthStore()
  const { letters, loading, reload, deleteLetter, markOpened } = useLetters()
  const [showForm, setShowForm] = useState(false)
  const [viewLetter, setViewLetter] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', open_date: format(new Date(Date.now() + 86400000 * 365), 'yyyy-MM-dd') })

  const handleSave = async () => {
    if (!user || !form.title || !form.content) return
    setSaving(true)
    try {
      await lettersService.create({ author_id: user.id, ...form })
      toast.success('Carta criada! 💌')
      setShowForm(false)
      setForm({ title: '', content: '', open_date: format(new Date(Date.now() + 86400000 * 365), 'yyyy-MM-dd') })
      reload()
    } catch { toast.error('Erro ao criar carta') }
    finally { setSaving(false) }
  }

  if (loading) return <PageLoader />

  const viewingLetter = letters.find(l => l.id === viewLetter)

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Cartas para o Futuro" subtitle="Mensagens que o tempo guarda" icon="💌"
        actions={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Nova carta</Button>}
      />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
        {letters.length === 0 ? (
          <EmptyState icon="💌" title="Nenhuma carta ainda" description="Escreva uma mensagem para ser aberta no futuro." action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Escrever carta</Button>} />
        ) : (
          <div className="space-y-4">
            {letters.map(letter => {
              const unlocked = lettersService.isUnlocked(letter)
              const daysLeft = lettersService.daysUntilUnlock(letter)
              return (
                <motion.div key={letter.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card hover className={`p-5 cursor-pointer ${unlocked ? 'border-nebula-purple/30' : ''}`}
                    onClick={() => unlocked ? setViewLetter(letter.id) : undefined}>
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${unlocked ? 'animate-float' : 'opacity-50'}`}>
                        {unlocked ? '💌' : '🔒'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-white truncate">{letter.title}</h3>
                          <button onClick={e => { e.stopPropagation(); deleteLetter(letter.id) }} className="text-white/20 hover:text-red-400 transition-colors shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                          Abre em: {formatRelativeDate(letter.open_date)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {unlocked ? (
                            <Badge variant="green"><Unlock className="w-2.5 h-2.5 mr-1 inline" /> Disponível</Badge>
                          ) : (
                            <Badge variant="gray"><Lock className="w-2.5 h-2.5 mr-1 inline" /> {daysLeft} dia{daysLeft !== 1 ? 's' : ''}</Badge>
                          )}
                          {letter.is_opened && <Badge variant="purple">Lida</Badge>}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Escrever carta para o futuro" size="lg">
        <div className="space-y-4">
          <Input label="Título *" placeholder="Ex: Para o nosso aniversário de 10 anos" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Textarea label="Mensagem *" placeholder="Escreva sua carta aqui... Ela só será lida na data que você escolher." rows={6} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
          <Input label="Abrir na data *" type="date" value={form.open_date} onChange={e => setForm(p => ({ ...p, open_date: e.target.value }))} />
          <Button onClick={handleSave} loading={saving} size="lg" className="w-full">Selar carta 💌</Button>
        </div>
      </Modal>

      <Modal open={!!viewLetter} onClose={() => { setViewLetter(null); if (viewingLetter && !viewingLetter.is_opened) markOpened(viewingLetter.id) }} title={viewingLetter?.title} size="lg">
        {viewingLetter && (
          <div>
            <p className="text-xs text-white/40 mb-4">Escrita em {formatDate(viewingLetter.created_at)}</p>
            <div className="whitespace-pre-wrap text-white/80 leading-relaxed font-display">
              {viewingLetter.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
