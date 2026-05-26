import { useState, FormEvent } from 'react'
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

  // Já autenticado → vai direto para o painel
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: '#0a0a0a',
        backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 70%)',
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-4">
            <Scissors className="w-7 h-7 text-zinc-950" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Barbie Pro</h1>
          <p className="text-zinc-500 text-sm mt-1">Acesso ao painel administrativo</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/8 p-6"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}
        >
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 focus:bg-white/5 transition-colors"
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
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-white/10 bg-white/3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 focus:bg-white/5 transition-colors"
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

            {/* Botão */}
            <button
              type="submit"
              disabled={submitting || !email || !password}
              className={cn(
                'w-full py-3 rounded-xl font-bold text-sm transition-all mt-2',
                submitting || !email || !password
                  ? 'bg-white/5 text-zinc-600 cursor-not-allowed'
                  : 'bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-lg shadow-amber-500/25 active:scale-[0.98]',
              )}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <p className="text-center text-zinc-700 text-xs mt-6">
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  )
}
