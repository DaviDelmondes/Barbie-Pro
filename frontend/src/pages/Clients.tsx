import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePageAnimation } from '@/hooks/usePageAnimation'

const STATUS_LABEL: Record<string, string> = {
  done: 'Concluído', confirmed: 'Confirmado', pending: 'Pendente', cancelled: 'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  done: 'bg-green-500/10 text-green-400 border-green-500/30',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  pending: 'bg-white/10 text-zinc-300 border-white/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const clients = [
  {
    id: '1', name: 'João Pedro', phone: '(11) 99100-0001', initials: 'JP',
    appointments: [
      { date: '23/05/2026', service: 'Corte Degradê', barber: 'Carlos Silva', value: 45, status: 'done' },
      { date: '10/05/2026', service: 'Corte Simples', barber: 'Carlos Silva', value: 35, status: 'done' },
    ],
  },
  {
    id: '2', name: 'Marcos Lima', phone: '(11) 99100-0002', initials: 'ML',
    appointments: [
      { date: '24/05/2026', service: 'Corte + Barba', barber: 'Carlos Silva', value: 60, status: 'confirmed' },
      { date: '08/05/2026', service: 'Barba', barber: 'Rafael Souza', value: 30, status: 'done' },
      { date: '25/04/2026', service: 'Corte Simples', barber: 'Lucas Mendes', value: 35, status: 'done' },
    ],
  },
  {
    id: '3', name: 'André Costa', phone: '(11) 99100-0003', initials: 'AC',
    appointments: [
      { date: '25/05/2026', service: 'Barba', barber: 'Rafael Souza', value: 30, status: 'pending' },
      { date: '15/05/2026', service: 'Hidratação', barber: 'Lucas Mendes', value: 40, status: 'done' },
    ],
  },
  {
    id: '4', name: 'Felipe Dias', phone: '(11) 99100-0004', initials: 'FD',
    appointments: [
      { date: '20/05/2026', service: 'Corte + Barba', barber: 'Rafael Souza', value: 60, status: 'done' },
    ],
  },
  {
    id: '5', name: 'Bruno Santos', phone: '(11) 99100-0005', initials: 'BS',
    appointments: [
      { date: '22/05/2026', service: 'Corte Simples', barber: 'Lucas Mendes', value: 35, status: 'cancelled' },
      { date: '05/05/2026', service: 'Corte Degradê', barber: 'Carlos Silva', value: 45, status: 'done' },
    ],
  },
]

function ClientRow({ client }: { client: typeof clients[0] }) {
  const [expanded, setExpanded] = useState(false)
  const total = client.appointments.filter(a => a.status === 'done').reduce((s, a) => s + a.value, 0)

  return (
    <div
      className="border border-white/8 rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
    >
      <button
        className="w-full flex items-center gap-4 p-4 hover:bg-white/3 transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {client.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white">{client.name}</p>
          <p className="text-sm text-zinc-500">{client.phone}</p>
        </div>
        <div className="text-right shrink-0 mr-2 sm:mr-4">
          <p className="text-xs text-zinc-500">Total</p>
          <p className="font-bold text-zinc-300">R$ {total}</p>
        </div>
        <div className="text-right shrink-0 mr-2 hidden sm:block">
          <p className="text-xs text-zinc-500">Visitas</p>
          <p className="font-bold text-white">{client.appointments.filter(a => a.status === 'done').length}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-white/6 divide-y divide-white/4">
          {client.appointments.map((apt, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Scissors className="w-4 h-4 text-zinc-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{apt.service}</p>
                <p className="text-xs text-zinc-500">{apt.barber} · {apt.date}</p>
              </div>
              <span className="text-sm font-semibold text-zinc-300 shrink-0">R$ {apt.value}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full border shrink-0', STATUS_COLOR[apt.status])}>
                {STATUS_LABEL[apt.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Clients() {
  const pageRef = usePageAnimation()
  const [search, setSearch] = useState('')
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  return (
    <div ref={pageRef} className="p-4 md:p-8">
      <div data-animate className="mb-8">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <p className="text-zinc-400 text-sm mt-1">{clients.length} clientes cadastrados</p>
      </div>

      <div data-animate className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cliente por nome ou telefone..."
          className="w-full border border-white/8 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-zinc-600 py-12">Nenhum cliente encontrado</p>
        ) : (
          filtered.map(c => (
            <div key={c.id} data-scroll>
              <ClientRow client={c} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
