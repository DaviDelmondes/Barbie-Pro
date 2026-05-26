import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Clock, Check, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePageAnimation } from '@/hooks/usePageAnimation'
import { supabase } from '@/lib/supabase'
import type { AppointmentStatus } from '@/types'

// ── Types ──────────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  done: 'Concluído',
  cancelled: 'Cancelado',
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  done: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-zinc-700/50 text-zinc-500 border-zinc-700',
}

type AptRow = {
  id: string
  scheduled_at: string
  status: AppointmentStatus
  client_name: string | null
  barber: { name: string } | null
  service: { name: string; price: number } | null
}

type FilterKey = 'all' | AppointmentStatus

const FILTER_TABS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'done', label: 'Concluídos' },
  { key: 'cancelled', label: 'Cancelados' },
]

// ── Fetcher ────────────────────────────────────────────────────────────────────

async function fetchAppointments(): Promise<AptRow[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, scheduled_at, status, client_name, barber:profiles!barber_id(name), service:services!service_id(name, price)')
    .order('scheduled_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as AptRow[]
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Booking() {
  const pageRef = usePageAnimation()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<FilterKey>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: fetchAppointments,
    refetchInterval: 30_000,
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-appointments'] }),
    onError: (err) => console.error('Erro ao atualizar status:', err),
  })

  const visible = (data ?? []).filter(a => filter === 'all' || a.status === filter)

  return (
    <div ref={pageRef} className="p-4 md:p-8">
      <div data-animate className="mb-6">
        <h1 className="text-2xl font-bold text-white">Agendamentos</h1>
        <p className="text-zinc-400 text-sm mt-1">{data?.length ?? 0} agendamento(s) no total</p>
      </div>

      {/* Filtros */}
      <div data-animate className="flex gap-2 flex-wrap mb-6">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium border transition-all',
              filter === tab.key
                ? 'bg-amber-500 text-zinc-950 border-amber-500'
                : 'border-white/8 text-zinc-400 hover:text-white hover:bg-white/5',
            )}
          >
            {tab.label}
            {tab.key !== 'all' && data && (
              <span className="ml-1.5 text-xs opacity-60">
                {data.filter(a => a.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Erro de atualização */}
      {updateStatus.isError && (
        <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          Erro ao atualizar: {(updateStatus.error as Error)?.message ?? 'Verifique o console e a policy de UPDATE no Supabase.'}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && visible.length === 0 && (
        <div className="text-center py-20 text-zinc-600 text-sm">
          Nenhum agendamento encontrado.
        </div>
      )}

      {/* Lista */}
      {!isLoading && visible.length > 0 && (
        <div className="space-y-3">
          {visible.map(apt => {
            const { date, time, weekday } = formatDateTime(apt.scheduled_at)
            const initials = (apt.client_name ?? '?').slice(0, 2).toUpperCase()
            const canConfirm = apt.status === 'pending'
            const canClose = apt.status === 'pending' || apt.status === 'confirmed'

            return (
              <div
                key={apt.id}
                data-scroll
                className="border border-white/8 rounded-xl p-4 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-sm">
                      {apt.client_name ?? 'Cliente'}
                    </p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border', STATUS_STYLES[apt.status])}>
                      {STATUS_LABELS[apt.status]}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">
                    {apt.service?.name} · {apt.barber?.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {weekday} {date}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {time}
                    </span>
                    {apt.service?.price != null && (
                      <span className="text-xs font-semibold text-amber-400">
                        R$ {apt.service.price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  {canConfirm && (
                    <button
                      onClick={() => updateStatus.mutate({ id: apt.id, status: 'confirmed' })}
                      title="Confirmar"
                      className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canClose && (
                    <>
                      <button
                        onClick={() => updateStatus.mutate({ id: apt.id, status: 'done' })}
                        title="Concluído"
                        className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: apt.id, status: 'cancelled' })}
                        title="Cancelar"
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
