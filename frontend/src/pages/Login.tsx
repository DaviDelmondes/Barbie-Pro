import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Scissors, Lock, Mail } from 'lucide-react'
import gsap from 'gsap'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import barberPoleBg from '@/assets/barber-pole.jpeg'

export default function Login() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const cardRef = useRef<HTMLDivElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // Card entra de y:30, opacity:0 → y:0, opacity:1 quando o loading termina
  useEffect(() => {
    if (loading || !cardRef.current) return
    gsap.fromTo(
      cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 },
    )
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (user) return <Navigate to="/admin" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Email ou senha incorretos. Tente novamente.')
      setSubmitting(false)
      return
    }
    navigate('/admin', { replace: true })
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setResetLoading(true)
    await supabase.auth.resetPasswordForEmail(resetEmail)
    setResetSent(true)
    setResetLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#080808' }}>

      {/* Barber-pole background com blur + overlay escuro */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          inset: -24,
          backgroundImage: `url(${barberPoleBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
          transform: 'scale(1.05)',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)' }} />
      </div>

      {/* Conteúdo */}
      <div ref={cardRef} className="w-full max-w-sm relative" style={{ zIndex: 1, opacity: 0 }}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Barbie Pro</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
            Acesso ao painel administrativo
          </p>
        </div>

        {/* Card glassmorphism */}
        <div
          className="p-6"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(30px)',
            borderRadius: 24,
          }}
        >
          {forgotMode ? (
            resetSent ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-white font-semibold">Email de redefinição enviado!</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Verifique sua caixa de entrada e siga as instruções.
                </p>
                <button
                  onClick={() => { setForgotMode(false); setResetSent(false) }}
                  className="text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  Voltar ao login
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Digite seu email para receber o link de redefinição de senha.
                </p>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail}
                  className={cn(
                    'w-full py-3 rounded-xl font-bold text-sm transition-all mt-2',
                    resetLoading || !resetEmail
                      ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                      : 'bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98]',
                  )}
                >
                  {resetLoading ? 'Enviando...' : 'Enviar link'}
                </button>
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="w-full text-center text-xs transition-colors"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
                >
                  Voltar ao login
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs text-center py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !email || !password}
                className={cn(
                  'w-full py-3 rounded-xl font-bold text-sm transition-all mt-2',
                  submitting || !email || !password
                    ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                    : 'bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98]',
                )}
              >
                {submitting ? 'Entrando...' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={() => { setForgotMode(true); setResetEmail(email) }}
                className="w-full text-center text-xs transition-colors pt-1"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
              >
                Esqueci minha senha
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  )
}
