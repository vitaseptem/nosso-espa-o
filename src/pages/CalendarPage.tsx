import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO, isToday as dateFnsIsToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { useEvents } from '@/hooks/useEvents'
import { eventsService } from '@/services/eventsService'
import { useAuthStore } from '@/stores/authStore'
import { getNextOccurrence, daysUntil, EVENT_TYPE_LABELS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { CalendarEvent } from '@/types/database'

const eventTypeOptions = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))

export function CalendarPage() {
  const { user } = useAuthStore()
  const { events, loading, reload, deleteEvent } = useEvents()
  const [current, setCurrent] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', event_type: 'outro' as CalendarEvent['event_type'], event_date: format(new Date(), 'yyyy-MM-dd'), event_time: '', is_recurring: false, location: '' })

  const monthDays = useMemo(() => {
    const start = startOfMonth(current)
    const end = endOfMonth(current)
    return eachDayOfInterval({ start, end })
  }, [current])

  const eventsOnDay = (day: Date) =>
    events.filter(e => {
      const next = getNextOccurrence(e.event_date, e.is_recurring)
      return isSameDay(next, day) || isSameDay(parseISO(e.event_date), day)
    })

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return events
      .map(e => ({ e, next: getNextOccurrence(e.event_date, e.is_recurring) }))
      .filter(({ next }) => next >= now)
      .sort((a, b) => a.next.getTime() - b.next.getTime())
      .slice(0, 8)
  }, [events])

  const handleSave = async () => {
    if (!form.title || !user) return
    setSaving(true)
    try {
      await eventsService.create({ ...form, description: form.description || null, event_time: form.event_time || null, location: form.location || null, reminder_minutes: null, color: null, created_by: user.id })
      toast.success('Evento criado! 🎉')
      setShowForm(false)
      setForm({ title: '', description: '', event_type: 'outro', event_date: format(new Date(), 'yyyy-MM-dd'), event_time: '', is_recurring: false, location: '' })
      reload()
    } catch { toast.error('Erro ao criar evento') }
    finally { setSaving(false) }
  }

  if (loading) return <PageLoader />

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const firstDayOfWeek = startOfMonth(current).getDay()

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Calendário" subtitle="Datas especiais do casal" icon="📅"
        actions={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Novo evento</Button>}
      />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="xl:col-span-2">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <Button variant="ghost" size="icon" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="font-display font-semibold text-white capitalize">
                  {format(current, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map(d => <div key={d} className="text-center text-xs text-white/30 py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
                {monthDays.map(day => {
                  const dayEvents = eventsOnDay(day)
                  const isCurrentDay = dateFnsIsToday(day)
                  const isCurrentMonth = isSameMonth(day, current)
                  return (
                    <div key={day.toISOString()} className={`relative rounded-xl p-1.5 min-h-[44px] flex flex-col items-center ${isCurrentDay ? 'bg-nebula-purple/30 ring-1 ring-nebula-purple/50' : 'hover:bg-white/[0.04]'} ${!isCurrentMonth ? 'opacity-30' : ''} cursor-default`}>
                      <span className={`text-xs font-medium ${isCurrentDay ? 'text-nebula-purple' : 'text-white/60'}`}>{format(day, 'd')}</span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                          {dayEvents.slice(0, 3).map(e => (
                            <div key={e.id} className="w-1.5 h-1.5 rounded-full bg-nebula-pink" title={e.title} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Upcoming list */}
          <div>
            <h2 className="font-semibold text-white mb-3">Próximos eventos</h2>
            <div className="space-y-2">
              {upcomingEvents.map(({ e, next }) => {
                const days = daysUntil(next)
                return (
                  <motion.div key={e.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card hover className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{EVENT_TYPE_LABELS[e.event_type]?.slice(0, 2)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{e.title}</p>
                          <p className="text-xs text-white/40">{format(next, "d 'de' MMM", { locale: ptBR })}</p>
                          {e.is_recurring && <Badge variant="blue" className="mt-1 text-[10px]">Anual</Badge>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={days === 0 ? 'pink' : days <= 7 ? 'purple' : 'gray'}>{days === 0 ? 'Hoje' : `${days}d`}</Badge>
                          <button onClick={() => deleteEvent(e.id)} className="text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
              {upcomingEvents.length === 0 && <p className="text-sm text-white/30 text-center py-8">Nenhum evento cadastrado</p>}
            </div>
          </div>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo evento" size="md">
        <div className="space-y-4">
          <Input label="Título *" placeholder="Nome do evento" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <Select label="Tipo" options={eventTypeOptions} value={form.event_type} onChange={e => setForm(p => ({ ...p, event_type: e.target.value as CalendarEvent['event_type'] }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Data *" type="date" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} />
            <Input label="Hora" type="time" value={form.event_time} onChange={e => setForm(p => ({ ...p, event_time: e.target.value }))} />
          </div>
          <Input label="Local (opcional)" placeholder="Onde vai acontecer?" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_recurring} onChange={e => setForm(p => ({ ...p, is_recurring: e.target.checked }))} className="w-4 h-4 rounded accent-nebula-purple" />
            <span className="text-sm text-white/70">Repetir todo ano</span>
          </label>
          <Button onClick={handleSave} loading={saving} size="lg" className="w-full">Criar evento</Button>
        </div>
      </Modal>
    </div>
  )
}
