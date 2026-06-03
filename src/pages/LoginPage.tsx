import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StarField } from '@/components/ui/StarField'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { user, login, loading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email.trim().toLowerCase(), password)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer login'
      if (msg.includes('Invalid login credentials')) toast.error('E-mail ou senha incorretos')
      else if (msg.includes('bloqueado')) toast.error(msg)
      else toast.error('Erro ao fazer login')
    }
  }

  return (
    <div className="relative min-h-screen bg-cosmic flex items-center justify-center p-5 overflow-hidden">
      <StarField count={80} />

      <div className="absolute top-1/3 left-1/4 w-56 h-56 bg-nebula-purple/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-nebula-pink/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[360px]"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌌</div>
          <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-nebula-purple to-nebula-pink bg-clip-text text-transparent">
            Nosso Universo
          </h1>
          <p className="text-white/35 mt-1.5 text-sm">Espaço privado do nosso amor</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.07] backdrop-blur-xl rounded-2xl p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/60">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ fontSize: '16px' }}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-white placeholder:text-white/25 focus:outline-none focus:border-nebula-purple/50 transition-all min-h-[44px]"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Entrar ✨
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-5">
          Acesso exclusivo e privado 🔒
        </p>
      </motion.div>
    </div>
  )
}
