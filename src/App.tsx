import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { PageLoader } from './components/ui/Spinner'
import { useAuthStore } from './stores/authStore'

const DashboardPage  = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const TimelinePage   = lazy(() => import('./pages/TimelinePage').then(m => ({ default: m.TimelinePage })))
const AlbumPage      = lazy(() => import('./pages/AlbumPage').then(m => ({ default: m.AlbumPage })))
const CalendarPage   = lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })))
const ThoughtsPage   = lazy(() => import('./pages/ThoughtsPage').then(m => ({ default: m.ThoughtsPage })))
const MoodPage       = lazy(() => import('./pages/MoodPage').then(m => ({ default: m.MoodPage })))
const ChatPage       = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })))
const CallPage       = lazy(() => import('./pages/CallPage').then(m => ({ default: m.CallPage })))
const LettersPage    = lazy(() => import('./pages/LettersPage').then(m => ({ default: m.LettersPage })))
const UniversePage   = lazy(() => import('./pages/UniversePage').then(m => ({ default: m.UniversePage })))
const ValentinaPage  = lazy(() => import('./pages/ValentinaPage').then(m => ({ default: m.ValentinaPage })))
const SettingsPage   = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => { initialize() }, [initialize])

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1035',
            color: '#fff',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#a855f7', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/"            element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
          <Route path="/timeline"    element={<Suspense fallback={<PageLoader />}><TimelinePage /></Suspense>} />
          <Route path="/album"       element={<Suspense fallback={<PageLoader />}><AlbumPage /></Suspense>} />
          <Route path="/calendario"  element={<Suspense fallback={<PageLoader />}><CalendarPage /></Suspense>} />
          <Route path="/pensamentos" element={<Suspense fallback={<PageLoader />}><ThoughtsPage /></Suspense>} />
          <Route path="/humor"       element={<Suspense fallback={<PageLoader />}><MoodPage /></Suspense>} />
          <Route path="/chat"        element={<Suspense fallback={<PageLoader />}><ChatPage /></Suspense>} />
          <Route path="/chamada"     element={<Suspense fallback={<PageLoader />}><CallPage /></Suspense>} />
          <Route path="/cartas"      element={<Suspense fallback={<PageLoader />}><LettersPage /></Suspense>} />
          <Route path="/universo"    element={<Suspense fallback={<PageLoader />}><UniversePage /></Suspense>} />
          <Route path="/valentina"   element={<Suspense fallback={<PageLoader />}><ValentinaPage /></Suspense>} />
          <Route path="/configuracoes" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
