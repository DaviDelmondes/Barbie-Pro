import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import gsap from 'gsap'
import { initLenis, destroyLenis } from '@/lib/smooth-scroll'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout'
import GrainOverlay from '@/components/GrainOverlay'
import CustomCursor from '@/components/CustomCursor'
import Home from '@/pages/Home'
import PublicBooking from '@/pages/PublicBooking'
import Login from '@/pages/Login'
import Booking from '@/pages/Booking'
import Calendar from '@/pages/Calendar'
import Professionals from '@/pages/Professionals'
import Clients from '@/pages/Clients'
import Financial from '@/pages/Financial'

const queryClient = new QueryClient()

function AdminLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  )
}

function AppRoutes() {
  const location = useLocation()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initLenis()
    return () => destroyLenis()
  }, [])

  // Fade-in suave a cada troca de rota
  useEffect(() => {
    if (!pageRef.current) return
    gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
  }, [location.pathname])

  return (
    <div ref={pageRef}>
      <Routes>
        {/* ── Públicas ─────────────────────────────────────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/agendar" element={<PublicBooking />} />
        <Route path="/login" element={<Login />} />

        {/* ── Admin (requer autenticação) ──────────────────────────── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="agendamentos" replace />} />
          <Route path="agendamentos" element={<Booking />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="professionals" element={<Professionals />} />
          <Route path="clients" element={<Clients />} />
          <Route path="financial" element={<Financial />} />
        </Route>
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <GrainOverlay />
          <CustomCursor />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
