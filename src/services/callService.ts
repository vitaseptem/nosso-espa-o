import { supabase } from '@/lib/supabase'
import type { AudioCall, CallSignal, SignalType } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type SignalPayload = RTCSessionDescriptionInit | RTCIceCandidateInit

export const callService = {
  async initiateCall(callerId: string, calleeId: string): Promise<AudioCall> {
    const { data, error } = await supabase
      .from('audio_calls')
      .insert({ caller_id: callerId, callee_id: calleeId, status: 'chamando' })
      .select('*, caller:users!caller_id(*), callee:users!callee_id(*)')
      .single()
    if (error || !data) throw error ?? new Error('Falha ao iniciar chamada')
    return data as AudioCall
  },

  async updateStatus(callId: string, status: AudioCall['status']): Promise<void> {
    const updates: Partial<AudioCall> = { status }
    if (status === 'aceita') updates.accepted_at = new Date().toISOString()
    if (status === 'encerrada' || status === 'recusada') updates.ended_at = new Date().toISOString()
    await supabase.from('audio_calls').update(updates).eq('id', callId)
  },

  async sendSignal(callId: string, senderId: string, kind: SignalType, payload: SignalPayload): Promise<void> {
    await supabase.from('call_signals').insert({
      call_id: callId,
      sender_id: senderId,
      kind,
      payload: payload as Record<string, unknown>,
    })
  },

  subscribeToCall(callId: string, onSignal: (signal: CallSignal) => void): RealtimeChannel {
    return supabase
      .channel(`call-${callId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'call_signals',
        filter: `call_id=eq.${callId}`,
      }, (payload) => onSignal(payload.new as CallSignal))
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'audio_calls',
        filter: `id=eq.${callId}`,
      }, (payload) => {
        const call = payload.new as AudioCall
        if (call.status === 'encerrada' || call.status === 'recusada') {
          onSignal({ kind: 'ice', payload: { __hangup: true } } as unknown as CallSignal)
        }
      })
      .subscribe()
  },

  async getActiveCall(userId: string): Promise<AudioCall | null> {
    const { data } = await supabase
      .from('audio_calls')
      .select('*, caller:users!caller_id(*), callee:users!callee_id(*)')
      .in('status', ['chamando', 'aceita'])
      .or(`caller_id.eq.${userId},callee_id.eq.${userId}`)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data as AudioCall | null
  },
}
