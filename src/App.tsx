import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TimelinePage } from './pages/TimelinePage'
import { AlbumPage } from './pages/AlbumPage'
import { CalendarPage } from './pages/CalendarPage'
import { ThoughtsPage } from './pages/ThoughtsPage'
import { MoodPage } from './pages/MoodPage'
import { ChatPage } from './pages/ChatPage'
import { CallPage } from './pages/CallPage'
import { LettersPage } from './pages/LettersPage'
import { UniversePage } from './pages/UniversePage'
import { ValentinaPage } from './pages/ValentinaPage'
import { SettingsPage } from './pages/SettingsPage'
import { useAuthStore } from './stores/authStore'

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
          <Route path="/"            element={<DashboardPage />} />
          <Route path="/timeline"    element={<TimelinePage />} />
          <Route path="/album"       element={<AlbumPage />} />
          <Route path="/calendario"  element={<CalendarPage />} />
          <Route path="/pensamentos" element={<ThoughtsPage />} />
          <Route path="/humor"       element={<MoodPage />} />
          <Route path="/chat"        element={<ChatPage />} />
          <Route path="/chamada"     element={<CallPage />} />
          <Route path="/cartas"      element={<LettersPage />} />
          <Route path="/universo"    element={<UniversePage />} />
          <Route path="/valentina"      element={<ValentinaPage />} />
          <Route path="/configuracoes"  element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
