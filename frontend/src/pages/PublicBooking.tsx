import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Check, Clock,
  Scissors, CheckCircle, Phone, User,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Service, Profile } from '@/types'
import barberPoleBg from '@/assets/barber-pole.jpeg'

// ── Constants ────────────────────────────────────────────────────────────────

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const DAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DAYS_LETTER = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const FIXED_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
]

function formatDate(d: Date) {
  return `${DAYS_FULL[d.getDay()]}, ${d.getDate()} de ${MONTHS_SHORT[d.getMonth()]}`
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('price')
  if (error) throw error
  return data
}

async function fetchBarbers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'barber')
    .order('name')
  console.log('barbeiros:', data, 'erro:', error)
  if (error) throw error
  return data ?? []
}

// ── MonthCalendar ─────────────────────────────────────────────────────────────

function MonthCalendar({
  selected,
  onSelect,
}: {
  selected: Date | null
  onSelect: (d: Date) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  function goToPrevMonth() {
    if (isCurrentMonth) return
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function goToNextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={goToPrevMonth}
          disabled={isCurrentMonth}
          style={{ padding: 8, background: 'none', border: 'none', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', opacity: isCurrentMonth ? 0.25 : 1, color: '#a1a1aa' }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
          {MONTHS_PT[viewMonth]} {viewYear}
        </span>
        <button
          onClick={goToNextMonth}
          style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS_LETTER.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#52525b', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />

          const dayDate = new Date(viewYear, viewMonth, day)
          const past = dayDate < today
          const sel = selected !== null &&
            selected.getFullYear() === viewYear &&
            selected.getMonth() === viewMonth &&
            selected.getDate() === day
          const tod = viewYear === today.getFullYear() &&
            viewMonth === today.getMonth() &&
            day === today.getDate()

          return (
            <button
              key={i}
              onClick={() => onSelect(new Date(viewYear, viewMonth, day))}
              disabled={past}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 500,
                cursor: past ? 'not-allowed' : 'pointer',
                opacity: past ? 0.3 : 1,
                backgroundColor: sel ? '#FFFFFF' : 'transparent',
                color: sel ? '#0a0a0a' : tod ? '#FFFFFF' : '#e4e4e7',
                border: tod && !sel ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                transition: 'background-color 0.15s, color 0.15s',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  const labels = ['Serviço', 'Profissional', 'Data & Hora', 'Confirmar']
  return (
    <div className="flex items-center justify-center mb-8">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                step === i + 1
                  ? 'bg-white text-zinc-950 shadow-lg shadow-white/20'
                  : step > i + 1
                  ? 'bg-white/10 border border-white/30'
                  : 'bg-white/5 border border-white/10 text-zinc-600',
              )}
            >
              {step > i + 1
                ? <Check className="w-3.5 h-3.5 text-zinc-950" />
                : <span className={step === i + 1 ? 'text-zinc-950' : ''}>{i + 1}</span>}
            </div>
            <span
              className={cn(
                'text-[10px] hidden sm:block',
                step === i + 1 ? 'text-white' : step > i + 1 ? 'text-zinc-500' : 'text-zinc-700',
              )}
            >
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div
              className={cn(
                'w-7 sm:w-10 h-px mx-1 mb-4 transition-colors duration-300',
                step > i + 1 ? 'bg-white/30' : 'bg-white/8',
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-xl bg-white/4 border border-white/6 animate-pulse', className)} />
}

// ── Main component ────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4

export default function PublicBooking() {
  const navigate = useNavigate()

  // Swap manifest so "Add to Home Screen" from /agendar opens on /agendar
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    const prev = link?.getAttribute('href') ?? '/manifest.json'
    if (link) link.setAttribute('href', '/manifest-cliente.json')
    return () => { if (link) link.setAttribute('href', prev) }
  }, [])

  const [step, setStep] = useState<Step>(1)
  const [success, setSuccess] = useState(false)
  const stepRef = useRef<HTMLDivElement>(null)

  // Stagger nos cards ao trocar de etapa
  useEffect(() => {
    if (!stepRef.current) return
    const cards = stepRef.current.querySelectorAll('[data-card]')
    if (cards.length) {
      gsap.fromTo(cards,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.45, ease: 'power3.out', clearProps: 'all' },
      )
    }
  }, [step])

  const [service, setService] = useState<Service | null>(null)
  const [barber, setBarber] = useState<Profile | null>(null)
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  // ── Queries ─────────────────────────────────────────────────────────────────

  const servicesQ = useQuery({
    queryKey: ['pub-services'],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000,
  })

  const barbersQ = useQuery({
    queryKey: ['pub-barbers'],
    queryFn: fetchBarbers,
    enabled: step >= 2,
    staleTime: 5 * 60 * 1000,
  })

  // ── Mutation ─────────────────────────────────────────────────────────────────

  const confirmMut = useMutation({
    mutationFn: async () => {
      if (!service || !barber || !date || !time) throw new Error('Dados incompletos')
      const [h, m] = time.split(':').map(Number)
      const scheduledAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0)
      const { error } = await supabase.from('appointments').insert({
        service_id: service.id,
        barber_id: barber.id,
        scheduled_at: scheduledAt.toISOString(),
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        status: 'pending',
      })
      if (error) throw error
    },
    onSuccess: () => setSuccess(true),
    onError: (err) => console.error('Erro ao confirmar agendamento:', err),
  })

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function canProceed(): boolean {
    if (step === 1) return !!service
    if (step === 2) return !!barber
    if (step === 3) return !!date && !!time
    return clientName.trim().length >= 2 && clientPhone.replace(/\D/g, '').length >= 10
  }

  function next() { if (canProceed()) setStep(s => Math.min(4, s + 1) as Step) }
  function back() { setStep(s => Math.max(1, s - 1) as Step) }

  // ── Tela de sucesso ───────────────────────────────────────────────────────────

  if (success) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-5 text-center"
        style={{ background: '#080808' }}
      >
        <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mb-6 shadow-2xl shadow-white/10">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Agendamento Confirmado!</h1>
        <p className="text-zinc-500 text-sm mb-8 max-w-xs">
          Seu horário foi reservado. Entraremos em contato para confirmar.
        </p>

        <div
          className="w-full max-w-sm border border-white/8 rounded-2xl p-5 text-left mb-8"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          {[
            { label: 'Serviço',       value: service?.name },
            { label: 'Profissional',  value: barber?.name },
            { label: 'Data',          value: date ? formatDate(date) : '' },
            { label: 'Horário',       value: time },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/6 last:border-0">
              <span className="text-zinc-500 text-sm">{label}</span>
              <span className="text-white font-medium text-sm">{value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3">
            <span className="text-zinc-400 font-medium text-sm">Valor</span>
            <span className="text-white font-bold text-xl">R$ {service?.price}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition-colors shadow-lg shadow-white/15"
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  // ── Render principal ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080808' }}>

      {/* Barber-pole background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          inset: -24,
          backgroundImage: `url(${barberPoleBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          filter: 'blur(6px)',
          transform: 'scale(1.05)',
        }} />
      </div>

      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-center gap-2.5 py-4 border-b border-white/5 relative"
        style={{ background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)', zIndex: 1 }}
      >
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Scissors className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white tracking-tight">Barbie Pro</span>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto relative" style={{ zIndex: 1 }}>
        <div className="max-w-md mx-auto px-4 pt-7 pb-32">
          <Stepper step={step} />

          <div ref={stepRef}>

          {/* ── Etapa 1: Serviço ────────────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Qual serviço?</h2>
              <p className="text-zinc-500 text-sm mb-5">Escolha o que você precisa.</p>

              {servicesQ.isLoading && (
                <div className="space-y-3">
                  {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-[72px]" />)}
                </div>
              )}

              {servicesQ.data && (
                <div className="space-y-3">
                  {servicesQ.data.map(s => (
                    <button
                      key={s.id}
                      data-card
                      onClick={(e) => {
                        setService(s)
                        gsap.fromTo(e.currentTarget, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
                      }}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all active:scale-[0.98]',
                        service?.id === s.id
                          ? 'border-white bg-white/10 shadow-lg shadow-white/10'
                          : 'border-white/8 bg-white/3 hover:border-white/18 hover:bg-white/5',
                      )}
                    >
                      <div>
                        <p className="font-semibold text-white text-[15px]">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{s.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="w-3 h-3 text-zinc-600" />
                          <span className="text-xs text-zinc-400">{s.duration_min} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-white font-bold text-lg">R$ {s.price}</span>
                        <div className={cn(
                          'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                          service?.id === s.id ? 'bg-white border-white' : 'border-white/20',
                        )}>
                          {service?.id === s.id && <Check className="w-3 h-3 text-zinc-950" />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Etapa 2: Profissional ────────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Com quem?</h2>
              <p className="text-zinc-500 text-sm mb-5">Escolha seu barbeiro preferido.</p>

              {barbersQ.isLoading && (
                <div className="space-y-3">
                  {[0, 1, 2].map(i => <Skeleton key={i} className="h-[76px]" />)}
                </div>
              )}

              {barbersQ.isError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-4 text-center space-y-1">
                  <p className="text-red-400 text-sm font-medium">Erro ao carregar profissionais</p>
                  <p className="text-red-400/60 text-xs font-mono">
                    {(barbersQ.error as Error)?.message ?? 'Verifique o console para detalhes'}
                  </p>
                </div>
              )}

              {barbersQ.data?.length === 0 && !barbersQ.isLoading && (
                <div className="rounded-xl border border-white/8 bg-white/3 p-6 text-center space-y-1">
                  <p className="text-zinc-400 text-sm">Nenhum barbeiro encontrado</p>
                  <p className="text-zinc-600 text-xs">
                    Verifique se a tabela profiles tem registros com role = 'barber' e se a RLS policy está configurada.
                  </p>
                </div>
              )}

              {barbersQ.data && barbersQ.data.length > 0 && (
                <div className="space-y-3">
                  {barbersQ.data.map(b => (
                    <button
                      key={b.id}
                      data-card
                      onClick={(e) => {
                        setBarber(b); setDate(null); setTime(null)
                        gsap.fromTo(e.currentTarget, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
                      }}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-[0.98]',
                        barber?.id === b.id
                          ? 'border-white bg-white/10 shadow-lg shadow-white/10'
                          : 'border-white/8 bg-white/3 hover:border-white/18 hover:bg-white/5',
                      )}
                    >
                      {b.avatar_url ? (
                        <img src={b.avatar_url} alt={b.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {b.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{b.name}</p>
                        {b.specialty && <p className="text-sm text-zinc-400 truncate">{b.specialty}</p>}
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all',
                        barber?.id === b.id ? 'bg-white border-white' : 'border-white/20',
                      )}>
                        {barber?.id === b.id && <Check className="w-3 h-3 text-zinc-950" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Etapa 3: Data & Hora ─────────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Quando?</h2>
              <p className="text-zinc-500 text-sm mb-5">Escolha uma data e horário.</p>

              <div
                className="border border-white/8 rounded-2xl p-4 mb-5"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <MonthCalendar
                  selected={date}
                  onSelect={d => { setDate(d); setTime(null) }}
                />
              </div>

              {date && (
                <>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                    Horários — {formatDate(date)}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {FIXED_SLOTS.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        style={{
                          padding: '14px 0',
                          borderRadius: 12,
                          border: time === slot ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                          backgroundColor: time === slot ? '#FFFFFF' : 'rgba(255,255,255,0.03)',
                          color: time === slot ? '#0a0a0a' : '#e4e4e7',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Etapa 4: Confirmação ─────────────────────────────────────────── */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Seus dados</h2>
              <p className="text-zinc-500 text-sm mb-5">Preencha para finalizar o agendamento.</p>

              {/* Resumo */}
              <div
                className="border border-white/8 rounded-2xl p-4 mb-5"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                {[
                  { label: 'Serviço',      value: service?.name },
                  { label: 'Profissional', value: barber?.name },
                  { label: 'Data',         value: date ? formatDate(date) : '' },
                  { label: 'Horário',      value: time },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/6 last:border-0">
                    <span className="text-zinc-500 text-sm">{label}</span>
                    <span className="text-white text-sm font-medium">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-zinc-400 font-medium text-sm">Total</span>
                  <span className="text-white font-bold text-xl">R$ {service?.price}</span>
                </div>
              </div>

              {/* Campos do cliente */}
              <div className="space-y-3 mb-5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-4 rounded-xl border border-white/10 bg-white/3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="(11) 99999-0000"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full pl-11 pr-4 py-4 rounded-xl border border-white/10 bg-white/3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>
              </div>

              {confirmMut.isError && (
                <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm text-center">
                  Erro ao confirmar: {(confirmMut.error as Error)?.message ?? 'Tente novamente.'}
                </div>
              )}

              <button
                onClick={() => confirmMut.mutate()}
                disabled={!canProceed() || confirmMut.isPending}
                className={cn(
                  'w-full py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98]',
                  canProceed() && !confirmMut.isPending
                    ? 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-xl shadow-white/15'
                    : 'bg-white/5 text-zinc-600 cursor-not-allowed',
                )}
              >
                {confirmMut.isPending ? 'Confirmando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          )}

          </div>{/* /stepRef */}
        </div>
      </div>

      {/* ── Navegação fixada no rodapé (etapas 1–3) ──────────────────────────── */}
      {step < 4 && (
        <div
          className="fixed bottom-0 left-0 right-0 px-4 py-4 border-t border-white/5"
          style={{ background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', zIndex: 10 }}
        >
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <button
              onClick={back}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors border',
                step === 1
                  ? 'opacity-0 pointer-events-none border-transparent'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border-white/8',
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>

            <button
              onClick={next}
              disabled={!canProceed()}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97]',
                canProceed()
                  ? 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-xl shadow-white/15'
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed',
              )}
            >
              Continuar
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
