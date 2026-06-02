import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { callService } from '@/services/callService'
import { useAuthStore } from '@/stores/authStore'
import type { AudioCall, CallSignal } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

type CallState = 'idle' | 'calling' | 'ringing' | 'active' | 'ended'

export function CallPage() {
  const { user, partner } = useAuthStore()
  const [callState, setCallState] = useState<CallState>('idle')
  const [activeCall, setActiveCall] = useState<AudioCall | null>(null)
  const [muted, setMuted] = useState(false)
  const [duration, setDuration] = useState(0)

  const peerRef = useRef<RTCPeerConnection | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const createPeer = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }]
    })
    return pc
  }

  const cleanup = () => {
    peerRef.current?.close()
    peerRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    channelRef.current?.unsubscribe()
    channelRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
    setCallState('idle')
    setActiveCall(null)
    setDuration(0)
    setMuted(false)
  }

  const startCall = async () => {
    if (!user || !partner) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const call = await callService.initiateCall(user.id, partner.id)
      setActiveCall(call)
      setCallState('calling')

      const pc = createPeer()
      peerRef.current = pc

      stream.getTracks().forEach(t => pc.addTrack(t, stream))

      pc.onicecandidate = async e => {
        if (e.candidate) {
          await callService.sendSignal(call.id, user.id, 'ice', e.candidate.toJSON())
        }
      }

      const remoteAudio = new Audio()
      pc.ontrack = e => { remoteAudio.srcObject = e.streams[0]; remoteAudio.play() }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      await callService.sendSignal(call.id, user.id, 'offer', offer)

      channelRef.current = callService.subscribeToCall(call.id, handleSignal)
      toast.success(`Chamando ${partner.display_name}...`)
    } catch (err) {
      toast.error('Não foi possível acessar o microfone')
      cleanup()
    }
  }

  const handleSignal = async (signal: CallSignal) => {
    if (!peerRef.current || !activeCall || !user) return
    if ((signal.payload as Record<string, unknown>).__hangup) { cleanup(); return }

    const pc = peerRef.current
    if (signal.kind === 'answer' && signal.sender_id !== user.id) {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.payload as unknown as RTCSessionDescriptionInit))
      setCallState('active')
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
      await callService.updateStatus(activeCall.id, 'aceita')
    } else if (signal.kind === 'offer' && signal.sender_id !== user.id) {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current.getTracks().forEach(t => pc.addTrack(t, streamRef.current!))
      }
      await pc.setRemoteDescription(new RTCSessionDescription(signal.payload as unknown as RTCSessionDescriptionInit))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await callService.sendSignal(activeCall.id, user.id, 'answer', answer)
      setCallState('active')
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    } else if (signal.kind === 'ice' && signal.sender_id !== user.id) {
      try { await pc.addIceCandidate(new RTCIceCandidate(signal.payload as RTCIceCandidateInit)) } catch {}
    }
  }

  const endCall = async () => {
    if (activeCall) await callService.updateStatus(activeCall.id, 'encerrada')
    cleanup()
  }

  const formatDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  useEffect(() => {
    if (!user) return
    callService.getActiveCall(user.id).then(call => {
      if (call && call.status === 'chamando' && call.callee_id === user.id) {
        setActiveCall(call)
        setCallState('ringing')
        channelRef.current = callService.subscribeToCall(call.id, handleSignal)
      }
    })
  }, [user])

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Chamada de Áudio" subtitle="Somente para nós dois 🎧" icon="📞" />
      <div className="flex-1 flex items-center justify-center px-6">
        <Card className="p-8 w-full max-w-sm text-center">
          <motion.div animate={callState === 'calling' || callState === 'ringing' ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
            <Avatar user={partner} size="xl" showOnline className="mx-auto mb-4" />
          </motion.div>
          <h2 className="font-display text-xl font-semibold text-white">{partner?.display_name ?? 'Amor'}</h2>
          <p className="text-white/40 text-sm mt-1 mb-8">
            {callState === 'idle' && (partner?.is_online ? 'Online' : 'Offline')}
            {callState === 'calling' && 'Chamando...'}
            {callState === 'ringing' && 'Recebendo chamada...'}
            {callState === 'active' && formatDuration(duration)}
          </p>

          <div className="flex items-center justify-center gap-4">
            {callState === 'active' && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setMuted(!muted); streamRef.current?.getAudioTracks().forEach(t => { t.enabled = muted }) }}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${muted ? 'bg-red-500/30 text-red-400' : 'bg-white/10 text-white/60'}`}>
                {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            )}

            {callState === 'idle' && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg">
                <Phone className="w-6 h-6 text-white" />
              </motion.button>
            )}

            {callState === 'ringing' && (
              <>
                <motion.button whileTap={{ scale: 0.95 }} onClick={async () => {
                  if (!activeCall || !user || !streamRef.current) {
                    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true })
                    const pc = createPeer(); peerRef.current = pc
                    streamRef.current.getTracks().forEach(t => pc.addTrack(t, streamRef.current!))
                    pc.onicecandidate = async e => { if (e.candidate && activeCall) await callService.sendSignal(activeCall.id, user!.id, 'ice', e.candidate.toJSON()) }
                    const remoteAudio = new Audio(); pc.ontrack = e => { remoteAudio.srcObject = e.streams[0]; remoteAudio.play() }
                  }
                }} className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={async () => { if (activeCall) await callService.updateStatus(activeCall.id, 'recusada'); cleanup() }}
                  className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
                  <PhoneOff className="w-5 h-5 text-white" />
                </motion.button>
              </>
            )}

            {(callState === 'calling' || callState === 'active') && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-lg">
                <PhoneOff className="w-6 h-6 text-white" />
              </motion.button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
