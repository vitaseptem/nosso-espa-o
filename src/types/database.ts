export type UserRole = 'marido' | 'esposa'
export type MediaType = 'foto' | 'video' | 'audio'
export type MemoryCategory = 'foto' | 'video' | 'data' | 'viagem' | 'evento' | 'outro'
export type EventType = 'aniversario' | 'casamento' | 'namoro' | 'viagem' | 'compromisso' | 'consulta' | 'evento_familiar' | 'outro'
export type MoodKind = 'feliz' | 'apaixonado' | 'cansado' | 'triste' | 'irritado' | 'animado' | 'saudade'
export type ThoughtResult = 'pendente' | 'acertou' | 'errou'
export type MessageType = 'texto' | 'imagem' | 'audio' | 'emoji'
export type CallStatus = 'chamando' | 'aceita' | 'recusada' | 'encerrada' | 'perdida'
export type SignalType = 'offer' | 'answer' | 'ice'
export type ValentinaCategory = 'primeiros_passos' | 'primeiras_palavras' | 'aniversarios' | 'passeios' | 'escola' | 'momentos_especiais' | 'conquistas' | 'familia'
export type NotificationType = 'mensagem' | 'chamada' | 'evento' | 'lembrete' | 'memoria' | 'humor' | 'pensamento' | 'carta' | 'sistema'

export interface AppSettings {
  id: 1
  couple_name: string
  relationship_start_date: string | null
  couple_photo_path: string | null
  valentina_name: string
  valentina_birth_date: string | null
  valentina_photo_path: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  role: UserRole
  display_name: string
  avatar_url: string | null
  is_online: boolean
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface Memory {
  id: string
  author_id: string
  title: string
  description: string | null
  memory_date: string
  location: string | null
  category: MemoryCategory
  is_favorite: boolean
  created_at: string
  updated_at: string
  media?: MemoryMedia[]
  author?: User
}

export interface MemoryMedia {
  id: string
  memory_id: string
  storage_path: string
  media_type: MediaType
  caption: string | null
  width: number | null
  height: number | null
  duration_sec: number | null
  size_bytes: number | null
  sort_order: number
  created_at: string
  url?: string
}

export interface CalendarEvent {
  id: string
  created_by: string
  title: string
  description: string | null
  event_type: EventType
  event_date: string
  event_time: string | null
  is_recurring: boolean
  reminder_minutes: number | null
  location: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface ThoughtGame {
  id: string
  author_id: string
  guesser_id: string | null
  hint: string | null
  secret_answer: string
  guess: string | null
  result: ThoughtResult
  points: number
  answered_at: string | null
  created_at: string
  author?: User
  guesser?: User
}

export interface MoodLog {
  id: string
  user_id: string
  mood: MoodKind
  note: string | null
  log_date: string
  created_at: string
  user?: User
}

export interface Message {
  id: string
  sender_id: string
  content: string | null
  message_type: MessageType
  media_path: string | null
  reply_to_id: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  sender?: User
  reply_to?: Message
  media_url?: string
}

export interface AudioCall {
  id: string
  caller_id: string
  callee_id: string
  status: CallStatus
  started_at: string
  accepted_at: string | null
  ended_at: string | null
  duration_seconds: number | null
  created_at: string
  caller?: User
  callee?: User
}

export interface CallSignal {
  id: string
  call_id: string
  sender_id: string
  kind: SignalType
  payload: Record<string, unknown>
  created_at: string
}

export interface FutureLetter {
  id: string
  author_id: string
  recipient_id: string | null
  title: string
  content: string
  open_date: string
  is_opened: boolean
  opened_at: string | null
  created_at: string
  author?: User
  recipient?: User
}

export interface ValentinaMemory {
  id: string
  author_id: string
  title: string
  description: string | null
  category: ValentinaCategory
  memory_date: string
  age_years: number | null
  age_months: number | null
  is_favorite: boolean
  created_at: string
  updated_at: string
  media?: ValentinaMedia[]
  author?: User
}

export interface ValentinaMedia {
  id: string
  memory_id: string
  storage_path: string
  media_type: MediaType
  caption: string | null
  width: number | null
  height: number | null
  duration_sec: number | null
  size_bytes: number | null
  sort_order: number
  created_at: string
  url?: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  data: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      app_settings:        { Row: AppSettings; Update: Partial<AppSettings> }
      users:               { Row: User; Update: Partial<User> }
      memories:            { Row: Memory; Insert: Omit<Memory,'id'|'created_at'|'updated_at'|'media'|'author'>; Update: Partial<Memory> }
      memory_media:        { Row: MemoryMedia; Insert: Omit<MemoryMedia,'id'|'created_at'|'url'>; Update: Partial<MemoryMedia> }
      events:              { Row: CalendarEvent; Insert: Omit<CalendarEvent,'id'|'created_at'|'updated_at'>; Update: Partial<CalendarEvent> }
      thoughts_game:       { Row: ThoughtGame; Insert: Omit<ThoughtGame,'id'|'created_at'|'author'|'guesser'>; Update: Partial<ThoughtGame> }
      mood_logs:           { Row: MoodLog; Insert: Omit<MoodLog,'id'|'created_at'|'user'>; Update: Partial<MoodLog> }
      messages:            { Row: Message; Insert: Omit<Message,'id'|'created_at'|'sender'|'reply_to'|'media_url'>; Update: Partial<Message> }
      audio_calls:         { Row: AudioCall; Insert: Omit<AudioCall,'id'|'created_at'|'caller'|'callee'>; Update: Partial<AudioCall> }
      call_signals:        { Row: CallSignal; Insert: Omit<CallSignal,'id'|'created_at'>; Update: never }
      future_letters:      { Row: FutureLetter; Insert: Omit<FutureLetter,'id'|'created_at'|'author'|'recipient'>; Update: Partial<FutureLetter> }
      valentina_memories:  { Row: ValentinaMemory; Insert: Omit<ValentinaMemory,'id'|'created_at'|'updated_at'|'media'|'author'>; Update: Partial<ValentinaMemory> }
      valentina_media:     { Row: ValentinaMedia; Insert: Omit<ValentinaMedia,'id'|'created_at'|'url'>; Update: Partial<ValentinaMedia> }
      notifications:       { Row: Notification; Insert: Omit<Notification,'id'|'created_at'>; Update: Partial<Notification> }
    }
  }
}
