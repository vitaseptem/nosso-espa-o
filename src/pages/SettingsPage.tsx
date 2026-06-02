import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Save, LogOut, User, Heart, Baby, Shield } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/stores/authStore'
import { supabase, getStorageUrl, STORAGE_BUCKETS } from '@/lib/supabase'
import { formatDate, calculateAge, calculateTimeTogetherFromString } from '@/lib/utils'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const { user, partner, settings, updateProfile, updateSettings, logout } = useAuthStore()

  const [displayName, setDisplayName] = useState(user?.display_name ?? '')
  const [coupleName, setCoupleName] = useState(settings?.couple_name ?? 'Nosso Universo')
  const [relationshipStart, setRelationshipStart] = useState(settings?.relationship_start_date ?? '')
  const [valentinaName, setValentinaName] = useState(settings?.valentina_name ?? 'Valentina')
  const [valentinaBirth, setValentinaBirth] = useState(settings?.valentina_birth_date ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)

  const age = calculateAge(settings?.valentina_birth_date ?? null)
  const timeTogether = calculateTimeTogetherFromString(settings?.relationship_start_date ?? null)

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return
    setSavingProfile(true)
    try {
      await updateProfile({ display_name: displayName.trim() })
      toast.success('Perfil atualizado! ✨')
    } catch {
      toast.error('Erro ao salvar perfil')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await updateSettings({
        couple_name: coupleName.trim() || 'Nosso Universo',
        relationship_start_date: relationshipStart || null,
        valentina_name: valentinaName.trim() || 'Valentina',
        valentina_birth_date: valentinaBirth || null,
      })
      toast.success('Configurações salvas! 🌌')
    } catch {
      toast.error('Erro ao salvar configurações')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.AVATARS)
        .upload(path, file, { upsert: true })
      if (error) throw error
      const url = await getStorageUrl(STORAGE_BUCKETS.AVATARS, path)
      await updateProfile({ avatar_url: url })
      toast.success('Foto atualizada! 📷')
    } catch {
      toast.error('Erro ao enviar foto')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Configurações" subtitle="Personalize o universo de vocês" icon="⚙️" />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full space-y-6">

        {/* Profile */}
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="p-6">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-nebula-purple" /> Meu perfil
            </h2>
            <div className="flex items-center gap-5 mb-5">
              <div className="relative">
                <Avatar user={user} size="xl" showOnline />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-nebula-purple flex items-center justify-center shadow-lg hover:bg-nebula-pink transition-colors disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <p className="font-semibold text-white">{user?.display_name}</p>
                <p className="text-sm text-white/40">{user?.email}</p>
                <Badge variant={user?.role === 'marido' ? 'blue' : 'pink'} className="mt-1.5">
                  {user?.role === 'marido' ? '👨 Marido' : '👩 Esposa'}
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <Input
                label="Nome de exibição"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Como quer ser chamado(a)?"
              />
              <Button onClick={handleSaveProfile} loading={savingProfile} size="sm">
                <Save className="w-4 h-4" /> Salvar perfil
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Couple settings */}
        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="p-6">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
              <Heart className="w-4 h-4 text-nebula-pink" /> Nosso relacionamento
            </h2>

            {settings?.relationship_start_date && (
              <div className="flex flex-wrap gap-3 mb-5">
                {[
                  { value: timeTogether.days, label: 'dias juntos' },
                  { value: `${timeTogether.years}a ${timeTogether.months}m`, label: 'de amor' },
                ].map((item, i) => (
                  <div key={i} className="bg-nebula-purple/10 border border-nebula-purple/20 rounded-xl px-4 py-2 text-center">
                    <p className="text-lg font-bold font-display text-white">{item.value}</p>
                    <p className="text-xs text-white/40">{item.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Nome do casal / plataforma"
                value={coupleName}
                onChange={e => setCoupleName(e.target.value)}
                placeholder="Ex: Nosso Universo"
              />
              <Input
                label="Data de início do relacionamento"
                type="date"
                value={relationshipStart}
                onChange={e => setRelationshipStart(e.target.value)}
              />
              <Button onClick={handleSaveSettings} loading={savingSettings} size="sm">
                <Save className="w-4 h-4" /> Salvar
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Valentina */}
        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="p-6">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
              <Baby className="w-4 h-4 text-nebula-pink" /> {settings?.valentina_name ?? 'Valentina'}
            </h2>

            {settings?.valentina_birth_date && (
              <div className="bg-nebula-pink/10 border border-nebula-pink/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
                <span className="text-3xl">👧</span>
                <div>
                  <p className="text-white font-semibold">
                    {age.years} ano{age.years !== 1 ? 's' : ''} e {age.months} mês{age.months !== 1 ? 'es' : ''}
                  </p>
                  <p className="text-xs text-white/40">
                    Nascida em {formatDate(settings.valentina_birth_date)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Nome da filha"
                value={valentinaName}
                onChange={e => setValentinaName(e.target.value)}
                placeholder="Ex: Valentina"
              />
              <Input
                label="Data de nascimento"
                type="date"
                value={valentinaBirth}
                onChange={e => setValentinaBirth(e.target.value)}
              />
              <Button onClick={handleSaveSettings} loading={savingSettings} size="sm">
                <Save className="w-4 h-4" /> Salvar
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Partner info */}
        {partner && (
          <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
            <Card className="p-6">
              <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-red-400" /> Meu amor
              </h2>
              <div className="flex items-center gap-4">
                <Avatar user={partner} size="lg" showOnline />
                <div>
                  <p className="font-semibold text-white">{partner.display_name}</p>
                  <p className="text-sm text-white/40">{partner.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant={partner.role === 'marido' ? 'blue' : 'pink'}>
                      {partner.role === 'marido' ? '👨 Marido' : '👩 Esposa'}
                    </Badge>
                    <span className={`text-xs ${partner.is_online ? 'text-emerald-400' : 'text-white/30'}`}>
                      {partner.is_online ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Security */}
        <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
          <Card className="p-6">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-nebula-blue" /> Segurança
            </h2>
            <div className="space-y-2 text-sm text-white/50">
              <p>🔒 Plataforma privada — apenas 2 usuários autorizados</p>
              <p>🛡️ Dados protegidos com Row Level Security</p>
              <p>📦 Arquivos armazenados em buckets privados</p>
              <p>💌 Cartas bloqueadas no servidor até a data de abertura</p>
            </div>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible">
          <Button variant="danger" size="lg" className="w-full" onClick={logout}>
            <LogOut className="w-4 h-4" /> Sair da conta
          </Button>
        </motion.div>

      </div>
    </div>
  )
}
