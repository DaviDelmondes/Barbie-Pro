import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePageAnimation } from '@/hooks/usePageAnimation'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const HOURS = Array.from({ length: 11 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`)

const barbers = [
  { id: '1', name: 'Carlos Silva', initials: 'CS', color: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400' },
  { id: '2', name: 'Rafael Souza', initials: 'RS', color: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400' },
  { id: '3', name: 'Lucas Mendes', initials: 'LM', color: 'bg-green-500', border: 'border-green-500', text: 'text-green-400' },
]

const appointments = [
  { id: '1', barberId: '1', client: 'João Pedro', service: 'Corte Degradê', hour: 9, day: 0 },
  { id: '2', barberId: '1', client: 'Marcos Lima', service: 'Corte + Barba', hour: 11, day: 0 },
  { id: '3', barberId: '2', client: 'André Costa', service: 'Barba', hour: 10, day: 0 },
  { id: '4', barberId: '2', client: 'Felipe Dias', service: 'Corte + Barba', hour: 14, day: 1 },
  { id: '5', barberId: '3', client: 'Bruno Santos', service: 'Corte Simples', hour: 9, day: 1 },
  { id: '6', barberId: '3', client: 'Ricardo Neto', service: 'Hidratação', hour: 13, day: 2 },
  { id: '7', barberId: '1', client: 'Thiago Alves', service: 'Corte Simples', hour: 15, day: 2 },
  { id: '8', barberId: '2', client: 'Gustavo Melo', service: 'Barba', hour: 10, day: 3 },
]

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

export default function Calendar() {
  const pageRef = usePageAnimation()
  const [weekOffset, setWeekOffset] = useState(0)
  const [activeBarbers, setActiveBarbers] = useState<string[]>(['1', '2', '3'])
  const days = getWeekDays(weekOffset)

  function toggleBarber(id: string) {
    setActiveBarbers(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id])
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
          <div className="flex items-center gap-2 flex-wrap">
            {barbers.map(b => (
              <button
                key={b.id}
                onClick={() => toggleBarber(b.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                  activeBarbers.includes(b.id)
                    ? `${b.border} bg-white/5 ${b.text}`
                    : 'border-white/8 text-zinc-600'
                )}
              >
                <div className={cn('w-4 h-4 rounded-full', activeBarbers.includes(b.id) ? b.color : 'bg-zinc-700')} />
                {b.name.split(' ')[0]}
              </button>
            ))}
          </div>
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
                    isToday ? 'bg-amber-500 text-zinc-950' : 'text-zinc-300'
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
                {days.map((_, dayIdx) => {
                  const slots = appointments.filter(a => a.day === dayIdx && a.hour === h && activeBarbers.includes(a.barberId))
                  return (
                    <div key={dayIdx} className="border-r border-white/4 last:border-r-0 p-1 space-y-1">
                      {slots.map(apt => {
                        const barber = barbers.find(b => b.id === apt.barberId)!
                        return (
                          <div key={apt.id} className={cn('rounded-md px-2 py-1.5 border-l-2 cursor-pointer transition-colors hover:brightness-110', barber.border)} style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <p className={cn('text-xs font-semibold truncate', barber.text)}>{apt.client}</p>
                            <p className="text-xs text-zinc-500 truncate">{apt.service}</p>
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
