import { Outlet, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { StarField } from '@/components/ui/StarField'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { PageLoader } from '@/components/ui/Spinner'

export function AppLayout() {
  const { user, initialized, setOnline } = useAuthStore()
  const { subscribe, unsubscribe, load: loadNotifs } = useNotificationStore()

  useEffect(() => {
    if (!user) return
    setOnline(true)
    loadNotifs(user.id)
    subscribe(user.id)
    const handleVisibility = () => setOnline(!document.hidden)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      setOnline(false)
      unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [user, setOnline, loadNotifs, subscribe, unsubscribe])

  if (!initialized) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="relative min-h-screen bg-cosmic overflow-hidden">
      <StarField count={70} />
      <div className="relative z-10 flex h-screen">
        <Sidebar className="hidden lg:flex" />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav className="lg:hidden" />
    </div>
  )
}
