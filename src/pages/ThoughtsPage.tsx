import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useThoughts } from '@/hooks/useThoughts'
import { useAuthStore } from '@/stores/authStore'
import { formatDate } from '@/lib/utils'

export function ThoughtsPage() {
  const { user, partner } = useAuthStore()
  const { thoughts, loading, createThought, submitGuess, totalScore } = useThoughts()
  const [showCreate, setShowCreate] = useState(false)
  const [guessModal, setGuessModal] = useState<string | null>(null)
  const [form, setForm] = useState({ secret: '', hint: '' })
  const [guessText, setGuessText] = useState('')

  const pending = thoughts.filter(t => t.result === 'pendente')
  const history = thoughts.filter(t => t.result !== 'pendente')

  if (loading) return <PageLoader />

  const isMyThought = (t: { author_id: string }) => t.author_id === user?.id

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Adivinhe meu Pensamento" subtitle="Quanto vocês se conhecem?" icon="🧠"
        actions={<Button size="sm" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Criar pensamento</Button>}
      />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full">
        {/* Score */}
        <Card className="p-4 mb-6 flex items-center gap-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <p className="text-sm text-white/50">Pontuação total do casal</p>
            <p className="text-2xl font-bold font-display text-white">{totalScore} pts</p>
          </div>
        </Card>

        {/* Pending */}
        {pending.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-white mb-3">Aguardando resposta</h2>
            <div className="space-y-3">
              {pending.map(t => (
                <Card key={t.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1">
                        {isMyThought(t) ? 'Você pensou' : `${partner?.display_name} pensou`}
                      </p>
                      {t.hint && <p className="text-sm text-white/70 italic">"{t.hint}"</p>}
                      {isMyThought(t) && <p className="text-sm text-nebula-purple mt-1">Resposta: {t.secret_answer}</p>}
                    </div>
                    {!isMyThought(t) && (
                      <Button size="sm" onClick={() => { setGuessModal(t.id); setGuessText('') }}>Adivinhar</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="font-semibold text-white mb-3">Histórico</h2>
            <div className="space-y-2">
              {history.map(t => (
                <Card key={t.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">{t.hint ?? t.secret_answer}</p>
                      {t.guess && <p className="text-xs text-white/40 mt-0.5">Tentativa: "{t.guess}"</p>}
                    </div>
                    <Badge variant={t.result === 'acertou' ? 'green' : 'red'}>
                      {t.result === 'acertou' ? '🎉 Acertou!' : '😅 Errou'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {thoughts.length === 0 && (
          <EmptyState icon="🧠" title="Nenhum pensamento ainda" description="Crie um pensamento e desafie seu amor a adivinhar!" action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Criar pensamento</Button>} />
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Criar pensamento">
        <div className="space-y-4">
          <Textarea label="Sua resposta secreta *" placeholder="O que você está pensando?" rows={2} value={form.secret} onChange={e => setForm(p => ({ ...p, secret: e.target.value }))} />
          <Input label="Dica (opcional)" placeholder="Uma dica para seu amor..." value={form.hint} onChange={e => setForm(p => ({ ...p, hint: e.target.value }))} />
          <Button onClick={async () => { if (!user || !form.secret) return; await createThought(user.id, form.secret, form.hint || undefined); setShowCreate(false); setForm({ secret: '', hint: '' }) }} size="lg" className="w-full">Criar 🧠</Button>
        </div>
      </Modal>

      <Modal open={!!guessModal} onClose={() => setGuessModal(null)} title="Adivinhe o pensamento">
        <div className="space-y-4">
          {guessModal && (() => {
            const t = thoughts.find(x => x.id === guessModal)
            return t ? (
              <>
                {t.hint && <p className="text-white/70 italic text-center text-lg">"{t.hint}"</p>}
                <Input label="Sua tentativa" placeholder="O que você acha que é?" value={guessText} onChange={e => setGuessText(e.target.value)} autoFocus />
                <Button onClick={async () => { if (!user || !guessText) return; await submitGuess(guessModal, guessText, t.secret_answer, user.id); setGuessModal(null) }} size="lg" className="w-full">Enviar resposta</Button>
              </>
            ) : null
          })()}
        </div>
      </Modal>
    </div>
  )
}
