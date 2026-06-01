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
    <div className="relative min-h-screen bg-cosmic flex items-center justify-center p-6 overflow-hidden">
      <StarField count={150} />

      {/* Nebula blur orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-nebula-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-nebula-pink/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🌌
          </motion.div>
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-nebula-purple via-nebula-pink to-nebula-blue bg-clip-text text-transparent">
            Nosso Universo
          </h1>
          <p className="text-white/40 mt-2 text-sm">Espaço privado do nosso amor ❤️</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="text-sm font-medium text-white/70">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-10 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-nebula-purple/60 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Entrar no universo ✨
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          Acesso exclusivo e privado 🔒
        </p>
      </motion.div>
    </div>
  )
}
