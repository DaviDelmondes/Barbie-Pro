import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Scissors, Lock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function Login() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // Já autenticado → vai direto para o painel
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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: '#080808',
        backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)',
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Barbie Pro</h1>
          <p className="text-zinc-500 text-sm mt-1">Acesso ao painel administrativo</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/8 p-6"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}
        >
          {forgotMode ? (
            resetSent ? (
              /* ── Sucesso reset ── */
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-white font-semibold">Email de redefinição enviado!</p>
                <p className="text-zinc-500 text-xs">Verifique sua caixa de entrada e siga as instruções.</p>
                <button
                  onClick={() => { setForgotMode(false); setResetSent(false) }}
                  className="text-zinc-400 text-sm hover:text-white transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            ) : (
              /* ── Form reset ── */
              <form onSubmit={handleReset} className="space-y-4">
                <p className="text-zinc-400 text-sm">Digite seu email para receber o link de redefinição de senha.</p>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/50 focus:bg-white/5 transition-colors"
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
                      : 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg shadow-white/15 active:scale-[0.98]',
                  )}
                >
                  {resetLoading ? 'Enviando...' : 'Enviar link'}
                </button>
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  Voltar ao login
                </button>
              </form>
            )
          ) : (
            /* ── Form login ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/50 focus:bg-white/5 transition-colors"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-white/10 bg-white/3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/50 focus:bg-white/5 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <p className="text-red-400 text-xs text-center py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  {error}
                </p>
              )}

              {/* Botão entrar */}
              <button
                type="submit"
                disabled={submitting || !email || !password}
                className={cn(
                  'w-full py-3 rounded-xl font-bold text-sm transition-all mt-2',
                  submitting || !email || !password
                    ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                    : 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg shadow-white/15 active:scale-[0.98]',
                )}
              >
                {submitting ? 'Entrando...' : 'Entrar'}
              </button>

              {/* Esqueci a senha */}
              <button
                type="button"
                onClick={() => { setForgotMode(true); setResetEmail(email) }}
                className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors pt-1"
              >
                Esqueci minha senha
              </button>
            </form>
          )}
        </div>

        {/* Rodapé */}
        <p className="text-center text-zinc-700 text-xs mt-6">
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  )
}
