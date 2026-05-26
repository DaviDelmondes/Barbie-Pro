import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, DollarSign, Users, CalendarCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePageAnimation } from '@/hooks/usePageAnimation'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────────

const PERIODS = ['Dia', 'Semana', 'Mês'] as const
type Period = typeof PERIODS[number]

type FinApt = {
  id: string
  scheduled_at: string
  client_name: string | null
  barber: { name: string } | null
  service: { name: string; price: number } | null
}

// ── Fetcher ────────────────────────────────────────────────────────────────────

async function fetchDoneAppointments(): Promise<FinApt[]> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .select('id, scheduled_at, client_name, barber:profiles!barber_id(name), service:services!service_id(name, price)')
    .eq('status', 'done')
    .gte('scheduled_at', monthStart)
    .order('scheduled_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as FinApt[]
}

// ── StatCard ───────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent: string
}) {
  return (
    <div
      className="border border-white/8 rounded-xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-4', accent)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-zinc-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Financial() {
  const pageRef = usePageAnimation()
  const [period, setPeriod] = useState<Period>('Mês')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-financial'],
    queryFn: fetchDoneAppointments,
    refetchInterval: 60_000,
  })

  const stats = useMemo(() => {
    const now = new Date()
    let apts = data ?? []

    if (period === 'Dia') {
      apts = apts.filter(a => new Date(a.scheduled_at).toDateString() === now.toDateString())
    } else if (period === 'Semana') {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      weekStart.setHours(0, 0, 0, 0)
      apts = apts.filter(a => new Date(a.scheduled_at) >= weekStart)
    }

    const revenue = apts.reduce((sum, a) => sum + (a.service?.price ?? 0), 0)
    const count = apts.length
    const avgTicket = count > 0 ? Math.round(revenue / count) : 0
    return { revenue, count, avgTicket, list: apts }
  }, [data, period])

  return (
    <div ref={pageRef} className="p-4 md:p-8">
      <div data-animate className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-zinc-400 text-sm mt-1">Receita de atendimentos concluídos</p>
        </div>
        <div className="flex border border-white/8 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                period === p ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          [0, 1, 2].map(i => (
            <div key={i} className="border border-white/8 rounded-xl p-5 h-32 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
          ))
        ) : (
          <>
            <div data-scroll>
              <StatCard
                icon={TrendingUp}
                label="Receita"
                value={`R$ ${stats.revenue.toLocaleString('pt-BR')}`}
                sub={`${stats.count} atendimento(s)`}
                accent="bg-green-500/20 text-green-400"
              />
            </div>
            <div data-scroll>
              <StatCard
                icon={Users}
                label="Atendimentos"
                value={String(stats.count)}
                sub="Concluídos no período"
                accent="bg-blue-500/20 text-blue-400"
              />
            </div>
            <div data-scroll className="col-span-2 md:col-span-1">
              <StatCard
                icon={DollarSign}
                label="Ticket Médio"
                value={`R$ ${stats.avgTicket.toLocaleString('pt-BR')}`}
                accent="bg-amber-500/20 text-amber-400"
              />
            </div>
          </>
        )}
      </div>

      {/* Lista de atendimentos */}
      <div
        data-scroll
        className="border border-white/8 rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
      >
        <div className="p-5 border-b border-white/6 flex items-center justify-between">
          <h2 className="font-semibold text-white">Atendimentos concluídos</h2>
          <span className="text-xs text-zinc-500">{period}</span>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && stats.list.length === 0 && (
          <div className="text-center py-10 text-zinc-600 text-sm">
            Nenhum atendimento concluído neste período.
          </div>
        )}

        {!isLoading && stats.list.length > 0 && (
          <div className="divide-y divide-white/4">
            {stats.list.map(apt => {
              const d = new Date(apt.scheduled_at)
              const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={apt.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {apt.service?.name} — {apt.barber?.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {apt.client_name ?? 'Cliente'} · {dateStr} às {timeStr}
                    </p>
                  </div>
                  <span className="font-semibold text-green-400 text-sm shrink-0">
                    + R$ {apt.service?.price ?? 0}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
