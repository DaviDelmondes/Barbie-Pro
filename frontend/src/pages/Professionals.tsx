import { useState } from 'react'
import { Scissors, Clock, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePageAnimation } from '@/hooks/usePageAnimation'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const professionals = [
  {
    id: '1', name: 'Carlos Silva', specialty: 'Degradê & Navalhado', phone: '(11) 99999-0001',
    initials: 'CS', color: 'bg-blue-500', commission: 50,
    services: ['Corte Simples', 'Corte Degradê', 'Corte + Barba'],
    schedule: [
      { weekday: 1, start: '08:00', end: '18:00' }, { weekday: 2, start: '08:00', end: '18:00' },
      { weekday: 3, start: '08:00', end: '18:00' }, { weekday: 4, start: '08:00', end: '18:00' },
      { weekday: 5, start: '08:00', end: '18:00' }, { weekday: 6, start: '08:00', end: '14:00' },
    ],
  },
  {
    id: '2', name: 'Rafael Souza', specialty: 'Barba & Bigode', phone: '(11) 99999-0002',
    initials: 'RS', color: 'bg-purple-500', commission: 45,
    services: ['Barba', 'Corte + Barba', 'Hidratação'],
    schedule: [
      { weekday: 1, start: '09:00', end: '19:00' }, { weekday: 2, start: '09:00', end: '19:00' },
      { weekday: 3, start: '09:00', end: '19:00' }, { weekday: 5, start: '09:00', end: '19:00' },
      { weekday: 6, start: '09:00', end: '15:00' },
    ],
  },
  {
    id: '3', name: 'Lucas Mendes', specialty: 'Corte Clássico', phone: '(11) 99999-0003',
    initials: 'LM', color: 'bg-green-500', commission: 50,
    services: ['Corte Simples', 'Corte Degradê', 'Barba'],
    schedule: [
      { weekday: 2, start: '08:00', end: '17:00' }, { weekday: 3, start: '08:00', end: '17:00' },
      { weekday: 4, start: '08:00', end: '17:00' }, { weekday: 5, start: '08:00', end: '17:00' },
      { weekday: 6, start: '08:00', end: '13:00' },
    ],
  },
]

function ProfessionalCard({ pro }: { pro: typeof professionals[0] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="border border-white/8 rounded-xl overflow-hidden transition-all"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
    >
      <div className="p-5 flex items-center gap-4">
        <div className={cn('w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-lg', pro.color)}>
          {pro.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{pro.name}</p>
          <p className="text-sm text-zinc-400">{pro.specialty}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{pro.phone}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-zinc-500">Comissão</p>
          <p className="text-lg font-bold text-amber-400">{pro.commission}%</p>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/6 p-5 space-y-5">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5" /> Serviços
            </p>
            <div className="flex flex-wrap gap-2">
              {pro.services.map(s => (
                <span key={s} className="px-3 py-1 bg-white/5 border border-white/8 text-zinc-300 text-xs rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Horário de trabalho
            </p>
            <div className="overflow-x-auto pb-1">
            <div className="grid grid-cols-7 gap-1 min-w-[340px]">
              {WEEKDAYS.map((day, i) => {
                const slot = pro.schedule.find(s => s.weekday === i)
                return (
                  <div key={day} className={cn('rounded-lg p-2 text-center', slot ? 'bg-white/5 border border-white/8' : 'bg-transparent')}>
                    <p className="text-xs text-zinc-500 mb-1">{day}</p>
                    {slot ? (
                      <>
                        <p className="text-xs text-white font-medium">{slot.start}</p>
                        <p className="text-xs text-zinc-400">{slot.end}</p>
                      </>
                    ) : (
                      <p className="text-xs text-zinc-700 font-medium">—</p>
                    )}
                  </div>
                )
              })}
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Professionals() {
  const pageRef = usePageAnimation()

  return (
    <div ref={pageRef} className="p-4 md:p-8">
      <div data-animate className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Profissionais</h1>
          <p className="text-zinc-400 text-sm mt-1">{professionals.length} barbeiros cadastrados</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-zinc-950 font-semibold rounded-xl hover:bg-amber-400 transition-colors text-sm shadow-lg shadow-amber-500/20 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Novo profissional
        </button>
      </div>

      <div className="space-y-4">
        {professionals.map(pro => (
          <div key={pro.id} data-scroll>
            <ProfessionalCard pro={pro} />
          </div>
        ))}
      </div>
    </div>
  )
}
