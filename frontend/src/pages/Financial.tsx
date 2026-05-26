import { useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Users, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePageAnimation } from '@/hooks/usePageAnimation'

const PERIODS = ['Dia', 'Semana', 'Mês'] as const
type Period = typeof PERIODS[number]

const summary: Record<Period, { revenue: number; expenses: number; appointments: number; commission: number }> = {
  Dia: { revenue: 345, expenses: 80, appointments: 7, commission: 138 },
  Semana: { revenue: 2180, expenses: 420, appointments: 43, commission: 872 },
  Mês: { revenue: 8740, expenses: 1650, appointments: 172, commission: 3496 },
}

const transactions = [
  { id: '1', type: 'income', description: 'Corte Degradê — Carlos Silva', client: 'João Pedro', value: 45, date: '25/05', barber: 'CS', barberColor: 'bg-blue-500' },
  { id: '2', type: 'income', description: 'Corte + Barba — Rafael Souza', client: 'Marcos Lima', value: 60, date: '25/05', barber: 'RS', barberColor: 'bg-purple-500' },
  { id: '3', type: 'expense', description: 'Compra de produtos', client: '—', value: 180, date: '24/05', barber: null, barberColor: '' },
  { id: '4', type: 'income', description: 'Barba — Lucas Mendes', client: 'André Costa', value: 30, date: '24/05', barber: 'LM', barberColor: 'bg-green-500' },
  { id: '5', type: 'expense', description: 'Conta de luz', client: '—', value: 240, date: '23/05', barber: null, barberColor: '' },
  { id: '6', type: 'income', description: 'Corte Simples — Carlos Silva', client: 'João Pedro', value: 35, date: '23/05', barber: 'CS', barberColor: 'bg-blue-500' },
  { id: '7', type: 'income', description: 'Hidratação — Lucas Mendes', client: 'Bruno Santos', value: 40, date: '22/05', barber: 'LM', barberColor: 'bg-green-500' },
]

const barberCommissions = [
  { name: 'Carlos Silva', initials: 'CS', color: 'bg-blue-500', appointments: 68, total: 3060, commission: 1530 },
  { name: 'Rafael Souza', initials: 'RS', color: 'bg-purple-500', appointments: 55, total: 2475, commission: 1114 },
  { name: 'Lucas Mendes', initials: 'LM', color: 'bg-green-500', appointments: 49, total: 2205, commission: 1103 },
]

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

export default function Financial() {
  const pageRef = usePageAnimation()
  const [period, setPeriod] = useState<Period>('Mês')
  const s = summary[period]
  const profit = s.revenue - s.expenses - s.commission

  return (
    <div ref={pageRef} className="p-4 md:p-8">
      <div data-animate className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-zinc-400 text-sm mt-1">Visão geral das finanças</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex border border-white/8 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                  period === p ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-white/8 text-zinc-300 font-medium rounded-xl hover:bg-white/5 transition-colors text-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Plus className="w-4 h-4" />
            Despesa
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: TrendingUp, label: 'Receita', value: `R$ ${s.revenue.toLocaleString('pt-BR')}`, sub: `${s.appointments} atendimentos`, accent: 'bg-green-500/20 text-green-400' },
          { icon: TrendingDown, label: 'Despesas', value: `R$ ${s.expenses.toLocaleString('pt-BR')}`, accent: 'bg-red-500/20 text-red-400' },
          { icon: Users, label: 'Comissões', value: `R$ ${s.commission.toLocaleString('pt-BR')}`, sub: 'Pago aos barbeiros', accent: 'bg-blue-500/20 text-blue-400' },
          { icon: DollarSign, label: 'Lucro Líquido', value: `R$ ${profit.toLocaleString('pt-BR')}`, accent: 'bg-amber-500/20 text-amber-400' },
        ].map((card) => (
          <div key={card.label} data-scroll>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transações */}
        <div
          data-scroll
          className="lg:col-span-2 border border-white/8 rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
        >
          <div className="p-5 border-b border-white/6">
            <h2 className="font-semibold text-white">Últimas transações</h2>
          </div>
          <div className="divide-y divide-white/4">
            {transactions.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-4 md:px-5 py-3.5">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', t.type === 'income' ? 'bg-green-500/15' : 'bg-red-500/15')}>
                  {t.type === 'income'
                    ? <TrendingUp className="w-4 h-4 text-green-400" />
                    : <TrendingDown className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{t.description}</p>
                  <p className="text-xs text-zinc-500">{t.client} · {t.date}</p>
                </div>
                {t.barber && (
                  <div className={cn('w-6 h-6 rounded-full hidden sm:flex items-center justify-center text-xs font-bold text-white shrink-0', t.barberColor)}>
                    {t.barber}
                  </div>
                )}
                <span className={cn('font-semibold shrink-0 text-sm', t.type === 'income' ? 'text-green-400' : 'text-red-400')}>
                  {t.type === 'income' ? '+' : '-'} R$ {t.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comissões */}
        <div
          data-scroll
          className="border border-white/8 rounded-xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
        >
          <div className="p-5 border-b border-white/6">
            <h2 className="font-semibold text-white">Comissões do mês</h2>
          </div>
          <div className="p-4 space-y-4">
            {barberCommissions.map(b => (
              <div key={b.name} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0', b.color)}>
                    {b.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm text-white font-medium truncate">{b.name.split(' ')[0]}</p>
                      <p className="text-sm font-bold text-amber-400">R$ {b.commission}</p>
                    </div>
                    <p className="text-xs text-zinc-500">{b.appointments} atend. · R$ {b.total} receita</p>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', b.color)} style={{ width: `${(b.commission / 1530) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
