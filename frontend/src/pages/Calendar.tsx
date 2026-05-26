import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePageAnimation } from '@/hooks/usePageAnimation'
import { supabase } from '@/lib/supabase'

// ── Constants ──────────────────────────────────────────────────────────────────

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const HOURS = Array.from({ length: 11 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`)

const COLORS = [
  { border: 'border-blue-500', text: 'text-blue-400', dot: 'bg-blue-500' },
  { border: 'border-purple-500', text: 'text-purple-400', dot: 'bg-purple-500' },
  { border: 'border-green-500', text: 'text-green-400', dot: 'bg-green-500' },
  { border: 'border-rose-500', text: 'text-rose-400', dot: 'bg-rose-500' },
  { border: 'border-cyan-500', text: 'text-cyan-400', dot: 'bg-cyan-500' },
]

// ── Types ──────────────────────────────────────────────────────────────────────

type BarberRow = { id: string; name: string }

type CalApt = {
  id: string
  scheduled_at: string
  client_name: string | null
  barber: { id: string; name: string } | null
  service: { name: string } | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getWeekDays(offset: number) {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7)
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

// ── Fetchers ───────────────────────────────────────────────────────────────────

async function fetchBarbers(): Promise<BarberRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'barber')
    .order('name')
  if (error) throw error
  return data ?? []
}

async function fetchWeekAppointments(start: Date, end: Date): Promise<CalApt[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, scheduled_at, client_name, barber:profiles!barber_id(id, name), service:services!service_id(name)')
    .gte('scheduled_at', start.toISOString())
    .lte('scheduled_at', end.toISOString())
    .in('status', ['pending', 'confirmed'])
  if (error) throw error
  return (data ?? []) as unknown as CalApt[]
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Calendar() {
  const pageRef = usePageAnimation()
  const [weekOffset, setWeekOffset] = useState(0)
  const [hiddenBarbers, setHiddenBarbers] = useState<Set<string>>(new Set())

  const days = getWeekDays(weekOffset)
  const weekStart = new Date(days[0]); weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(days[days.length - 1]); weekEnd.setHours(23, 59, 59, 999)

  const barbersQ = useQuery({
    queryKey: ['cal-barbers'],
    queryFn: fetchBarbers,
    staleTime: 5 * 60 * 1000,
  })

  const aptsQ = useQuery({
    queryKey: ['cal-appointments', weekOffset],
    queryFn: () => fetchWeekAppointments(weekStart, weekEnd),
    refetchInterval: 30_000,
  })

  const barbers = barbersQ.data ?? []
  const allApts = aptsQ.data ?? []
  const visibleApts = allApts.filter(a => a.barber && !hiddenBarbers.has(a.barber.id))

  function toggleBarber(id: string) {
    setHiddenBarbers(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function getColor(barberId: string) {
    const idx = barbers.findIndex(b => b.id === barberId)
    return COLORS[idx % COLORS.length] ?? COLORS[0]
  }

  return (
    <div ref={pageRef} className="p-4 md:p-8 flex flex-col" style={{ minHeight: '100vh' }}>
      <div data-animate className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendário</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {days[0].getDate()} – {days[5].getDate()} de {MONTHS[days[0].getMonth()]} de {days[0].getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filtros de barbeiro */}
          <div className="flex items-center gap-2 flex-wrap">
            {barbers.map((b, i) => {
              const color = COLORS[i % COLORS.length]
              const active = !hiddenBarbers.has(b.id)
              return (
                <button
                  key={b.id}
                  onClick={() => toggleBarber(b.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                    active ? `${color.border} bg-white/5 ${color.text}` : 'border-white/8 text-zinc-600',
                  )}
                >
                  <div className={cn('w-4 h-4 rounded-full', active ? color.dot : 'bg-zinc-700')} />
                  {b.name.split(' ')[0]}
                </button>
              )
            })}
          </div>

          {/* Navegação de semana */}
          <div className="flex items-center gap-1 border border-white/8 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-l-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              Hoje
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-r-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div data-scroll className="flex-1 overflow-auto border border-white/8 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)' }}>
        <div className="min-w-[700px]">
          {/* Header dias */}
          <div className="grid grid-cols-[64px_repeat(6,1fr)] border-b border-white/6 sticky top-0" style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(20px)', zIndex: 2 }}>
            <div className="border-r border-white/6" />
            {days.map((d, i) => {
              const isToday = d.toDateString() === new Date().toDateString()
              return (
                <div key={i} className="p-3 text-center border-r border-white/6 last:border-r-0">
                  <p className="text-xs text-zinc-500">{DAYS[d.getDay()]}</p>
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1 font-semibold text-sm',
                    isToday ? 'bg-white text-zinc-950' : 'text-zinc-300',
                  )}>
                    {d.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Linhas de hora */}
          {HOURS.map(hour => {
            const h = parseInt(hour)
            return (
              <div key={hour} className="grid grid-cols-[64px_repeat(6,1fr)] border-b border-white/4 min-h-[64px]">
                <div className="border-r border-white/6 p-2 flex items-start justify-end">
                  <span className="text-xs text-zinc-600">{hour}</span>
                </div>
                {days.map((day, dayIdx) => {
                  const slots = visibleApts.filter(a => {
                    if (!a.barber) return false
                    const d = new Date(a.scheduled_at)
                    return d.toDateString() === day.toDateString() && d.getHours() === h
                  })
                  return (
                    <div key={dayIdx} className="border-r border-white/4 last:border-r-0 p-1 space-y-1">
                      {slots.map(apt => {
                        const color = getColor(apt.barber!.id)
                        return (
                          <div
                            key={apt.id}
                            className={cn('rounded-md px-2 py-1.5 border-l-2 cursor-pointer transition-colors hover:brightness-110', color.border)}
                            style={{ background: 'rgba(255,255,255,0.04)' }}
                          >
                            <p className={cn('text-xs font-semibold truncate', color.text)}>
                              {apt.client_name ?? '—'}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">{apt.service?.name ?? ''}</p>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
