import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/Spinner'
import { useMemories } from '@/hooks/useMemories'
import { useEvents } from '@/hooks/useEvents'
import { formatDate } from '@/lib/utils'
import type { Memory, CalendarEvent } from '@/types/database'

interface StarData {
  x: number; y: number; r: number; memory?: Memory; event?: CalendarEvent; twinklePhase: number; twinkleSpeed: number
}

export function UniversePage() {
  const { memories, loading: loadingMem } = useMemories()
  const { events, loading: loadingEv } = useEvents()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<StarData[]>([])
  const bgStarsRef = useRef<{ x: number; y: number; r: number; phase: number }[]>([])
  const rafRef = useRef<number>(0)
  const [selected, setSelected] = useState<StarData | null>(null)

  const loading = loadingMem || loadingEv

  useEffect(() => {
    if (loading) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      buildStars(canvas.width, canvas.height)
    }

    const buildStars = (w: number, h: number) => {
      // background stars
      bgStarsRef.current = Array.from({ length: 200 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
      }))

      // memory stars
      const stars: StarData[] = memories.map((m, i) => ({
        x: 60 + Math.random() * (w - 120),
        y: 60 + Math.random() * (h - 120),
        r: m.is_favorite ? 6 : 4,
        memory: m,
        twinklePhase: (i / memories.length) * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.01,
      }))

      // event "planets"
      const planets: StarData[] = events.map((e, i) => ({
        x: 80 + Math.random() * (w - 160),
        y: 80 + Math.random() * (h - 160),
        r: 10,
        event: e,
        twinklePhase: (i / events.length) * Math.PI * 2,
        twinkleSpeed: 0.005,
      }))

      starsRef.current = [...stars, ...planets]
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // bg stars
      for (const s of bgStarsRef.current) {
        const a = 0.15 + 0.35 * Math.abs(Math.sin(t * 0.003 + s.phase))
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(248,250,252,${a})`; ctx.fill()
      }

      // memory stars
      for (const star of starsRef.current) {
        const pulse = 0.6 + 0.4 * Math.sin(t * star.twinkleSpeed * 50 + star.twinklePhase)
        const r = star.r * pulse

        if (star.event) {
          // planet glow
          const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, r * 2.5)
          grd.addColorStop(0, 'rgba(232,121,249,0.9)')
          grd.addColorStop(0.5, 'rgba(168,85,247,0.5)')
          grd.addColorStop(1, 'rgba(168,85,247,0)')
          ctx.beginPath(); ctx.arc(star.x, star.y, r * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = grd; ctx.fill()
          ctx.beginPath(); ctx.arc(star.x, star.y, r, 0, Math.PI * 2)
          ctx.fillStyle = '#e879f9'; ctx.fill()
        } else {
          // memory star
          const color = star.memory?.is_favorite ? '#fde68a' : '#bfdbfe'
          ctx.beginPath(); ctx.arc(star.x, star.y, r, 0, Math.PI * 2)
          ctx.fillStyle = color; ctx.fill()
          if (star.memory?.is_favorite) {
            ctx.beginPath(); ctx.arc(star.x, star.y, r * 2, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(253,230,138,0.15)'; ctx.fill()
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      for (const star of starsRef.current) {
        const dist = Math.hypot(mx - star.x, my - star.y)
        if (dist < (star.r + 8)) { setSelected(star); return }
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    canvas.addEventListener('click', handleClick)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      canvas.removeEventListener('click', handleClick)
    }
  }, [loading, memories, events])

  if (loading) return <PageLoader />

  return (
    <div className="flex flex-col h-full bg-space-950">
      <PageHeader title="Nosso Universo" subtitle={`${memories.length} estrelas · ${events.length} planetas`} icon="🌌" />
      <div className="flex-1 relative cursor-crosshair">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 text-xs text-white/30 pointer-events-none">
          <span>⭐ Estrela = memória</span>
          <span>🌸 Planeta = data especial</span>
          <span>💛 Dourada = favorita</span>
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.memory?.title ?? selected?.event?.title} size="md">
        {selected?.memory && (
          <div>
            <p className="text-white/50 text-sm mb-2">{formatDate(selected.memory.memory_date)}</p>
            {selected.memory.description && <p className="text-white/80">{selected.memory.description}</p>}
            {selected.memory.location && <p className="text-xs text-white/40 mt-2">📍 {selected.memory.location}</p>}
          </div>
        )}
        {selected?.event && (
          <div>
            <p className="text-white/50 text-sm mb-2">{formatDate(selected.event.event_date)}</p>
            {selected.event.description && <p className="text-white/80">{selected.event.description}</p>}
          </div>
        )}
      </Modal>
    </div>
  )
}
