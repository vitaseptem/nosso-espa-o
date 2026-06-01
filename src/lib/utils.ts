import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, differenceInMonths, differenceInYears, format, parseISO, isToday, isTomorrow, addYears, isAfter, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ptBR })
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Hoje'
  if (isTomorrow(d)) return 'Amanhã'
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function calculateTimeTogetherFromString(startDateStr: string | null) {
  if (!startDateStr) return { days: 0, months: 0, years: 0 }
  const start = parseISO(startDateStr)
  const now = new Date()
  return {
    years:  differenceInYears(now, start),
    months: differenceInMonths(now, start) % 12,
    days:   differenceInDays(now, start),
  }
}

export function calculateAge(birthDateStr: string | null): { years: number; months: number } {
  if (!birthDateStr) return { years: 0, months: 0 }
  const birth = parseISO(birthDateStr)
  const now = new Date()
  return {
    years:  differenceInYears(now, birth),
    months: differenceInMonths(now, birth) % 12,
  }
}

export function getNextOccurrence(eventDate: string, isRecurring: boolean): Date {
  const date = parseISO(eventDate)
  const now = new Date()
  if (!isRecurring) return date
  let next = date
  while (isBefore(next, now)) {
    next = addYears(next, 1)
  }
  return next
}

export function daysUntil(date: Date): number {
  return differenceInDays(date, new Date())
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const MOOD_LABELS: Record<string, string> = {
  feliz:      '😊 Feliz',
  apaixonado: '🥰 Apaixonado(a)',
  cansado:    '😴 Cansado(a)',
  triste:     '😔 Triste',
  irritado:   '😡 Irritado(a)',
  animado:    '🤩 Animado(a)',
  saudade:    '🤗 Saudade',
}

export const MOOD_EMOJIS: Record<string, string> = {
  feliz: '😊', apaixonado: '🥰', cansado: '😴',
  triste: '😔', irritado: '😡', animado: '🤩', saudade: '🤗',
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  aniversario:     '🎂 Aniversário',
  casamento:       '💍 Casamento',
  namoro:          '❤️ Namoro',
  viagem:          '✈️ Viagem',
  compromisso:     '📅 Compromisso',
  consulta:        '🏥 Consulta',
  evento_familiar: '👨‍👩‍👧 Evento Familiar',
  outro:           '📌 Outro',
}

export const VALENTINA_CATEGORY_LABELS: Record<string, string> = {
  primeiros_passos:   '👣 Primeiros Passos',
  primeiras_palavras: '💬 Primeiras Palavras',
  aniversarios:       '🎂 Aniversários',
  passeios:           '🌳 Passeios',
  escola:             '🎒 Escola',
  momentos_especiais: '⭐ Momentos Especiais',
  conquistas:         '🏆 Conquistas',
  familia:            '👨‍👩‍👧 Família',
}

export function isImageFile(path: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(path)
}

export function isVideoFile(path: string): boolean {
  return /\.(mp4|mov|webm|avi)$/i.test(path)
}

export function isAudioFile(path: string): boolean {
  return /\.(mp3|wav|ogg|m4a|aac)$/i.test(path)
}

export function clampText(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
}
