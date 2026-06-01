import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: string
  actions?: ReactNode
  backTo?: string
}

export function PageHeader({ title, subtitle, icon, actions, backTo }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-4 px-6 py-5 border-b border-white/[0.06]">
      {backTo && (
        <Button variant="ghost" size="icon" onClick={() => navigate(backTo)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h1 className="font-display text-xl font-semibold text-white">{title}</h1>
        </div>
        {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
