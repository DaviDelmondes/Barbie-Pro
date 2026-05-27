import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Calendar, Scissors, Users, DollarSign, CalendarCheck, Menu, X, LogOut } from 'lucide-react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import barberPoleBg from '@/assets/barber-pole.jpeg'

const nav = [
  { to: '/admin/agendamentos', icon: CalendarCheck, label: 'Agendamento' },
  { to: '/admin/calendar',     icon: Calendar,      label: 'Calendário' },
  { to: '/admin/professionals',icon: Scissors,      label: 'Profissionais' },
  { to: '/admin/clients',      icon: Users,         label: 'Clientes' },
  { to: '/admin/financial',    icon: DollarSign,    label: 'Financeiro' },
]

function NavItem({ to, icon: Icon, label, onNavigate }: {
  to: string; icon: React.ElementType; label: string; onNavigate?: () => void
}) {
  const iconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!iconRef.current) return
    const el = iconRef.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
    const scaleTo = gsap.quickTo(el, 'scale', { duration: 0.35, ease: 'power3.out' })

    const link = el.closest('a')!
    const enter = () => { xTo(3); scaleTo(1.2) }
    const leave = () => { xTo(0); scaleTo(1) }

    link.addEventListener('mouseenter', enter)
    link.addEventListener('mouseleave', leave)
    return () => {
      link.removeEventListener('mouseenter', enter)
      link.removeEventListener('mouseleave', leave)
    }
  }, [])

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
          isActive
            ? 'bg-white text-zinc-950 border border-white/10 shadow-sm'
            : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent',
        )
      }
    >
      <div ref={iconRef} className="shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      {label}
    </NavLink>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const close = () => setIsOpen(false)

  // Exibe a primeira parte do email como nome (ex: "david@..." → "david")
  const displayName = user?.email?.split('@')[0] ?? 'Admin'
  const displayInitial = displayName[0]?.toUpperCase() ?? 'A'

  async function handleLogout() {
    close()
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative min-h-screen text-white" style={{ background: '#080808' }}>

      {/* Barber-pole background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          inset: -24,
          backgroundImage: `url(${barberPoleBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.08,
          filter: 'blur(4px)',
          transform: 'scale(1.1)',
        }} />
      </div>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 border-b border-white/5"
        style={{ zIndex: 20, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button onClick={() => { navigate('/'); close() }} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Barbie Pro</span>
        </button>

        <div className="w-9" />
      </div>

      {/* Overlay */}
      <div
        className={cn(
          'md:hidden fixed inset-0 bg-black/60 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ zIndex: 25 }}
        onClick={close}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-white/5 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{ zIndex: 30, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(40px)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Fechar (mobile) */}
        <button
          className="md:hidden absolute top-3.5 right-3.5 p-1.5 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          onClick={close}
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <button
          onClick={() => { navigate('/'); close() }}
          className="p-6 border-b border-white/5 flex items-center gap-3 hover:bg-white/3 transition-colors w-full text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-none">Barbie Pro</p>
            <p className="text-xs text-zinc-500 mt-0.5">Gestão de Barbearia</p>
          </div>
        </button>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavItem key={item.to} {...item} onNavigate={close} />
          ))}
        </nav>

        {/* Usuário + Logout */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {displayInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-zinc-500">Administrador</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="relative min-h-screen pt-14 md:pt-0 md:ml-64" style={{ zIndex: 5 }}>
        {children}
      </main>
    </div>
  )
}
