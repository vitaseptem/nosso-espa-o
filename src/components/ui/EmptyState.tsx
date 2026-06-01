import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <h3 className="font-display text-lg font-semibold text-white/60 mb-2">{title}</h3>
      {description && <p className="text-sm text-white/40 max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  )
}
