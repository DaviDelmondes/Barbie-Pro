import { useState } from 'react'
import { Clock, ChevronRight, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePageAnimation } from '@/hooks/usePageAnimation'
import ParticlesBackground from '@/components/ParticlesBackground'

const services = [
  { id: '1', name: 'Corte Simples', duration: 30, price: 35 },
  { id: '2', name: 'Corte + Barba', duration: 50, price: 60 },
  { id: '3', name: 'Barba', duration: 25, price: 30 },
  { id: '4', name: 'Corte Degradê', duration: 40, price: 45 },
  { id: '5', name: 'Hidratação', duration: 30, price: 40 },
]

const barbers = [
  { id: '1', name: 'Carlos Silva', specialty: 'Degradê & Navalhado', initials: 'CS', color: 'bg-blue-500' },
  { id: '2', name: 'Rafael Souza', specialty: 'Barba & Bigode', initials: 'RS', color: 'bg-purple-500' },
  { id: '3', name: 'Lucas Mendes', specialty: 'Corte Clássico', initials: 'LM', color: 'bg-green-500' },
]

const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function getWeekDays() {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })
}

export default function Booking() {
  const pageRef = usePageAnimation()
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<number>(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const days = getWeekDays()
  const service = services.find(s => s.id === selectedService)
  const barber = barbers.find(b => b.id === selectedBarber)

  const canProceed =
    (step === 1 && selectedService) ||
    (step === 2 && selectedBarber) ||
    (step === 3 && selectedTime)

  function next() {
    if (canProceed && step < 4) setStep(s => s + 1)
  }

  return (
    <div ref={pageRef} className="p-4 md:p-8 max-w-3xl mx-auto relative">
      <ParticlesBackground count={50} opacity={0.18} speed={0.4} />
      <div data-animate className="mb-8">
        <h1 className="text-2xl font-bold text-white">Novo Agendamento</h1>
        <p className="text-zinc-400 text-sm mt-1">Preencha os dados para agendar um horário</p>
      </div>

      {/* Steps */}
      <div data-animate className="flex items-center gap-1 sm:gap-2 mb-8 overflow-x-auto pb-1">
        {['Serviço', 'Profissional', 'Data & Hora', 'Confirmação'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn(
              'flex items-center gap-2 text-sm font-medium',
              step === i + 1 ? 'text-amber-400' : step > i + 1 ? 'text-green-400' : 'text-zinc-600'
            )}>
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                step === i + 1 ? 'bg-amber-500 text-zinc-950' :
                step > i + 1 ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-600'
              )}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="hidden sm:block">{label}</span>
            </div>
            {i < 3 && <div className={cn('h-px w-8 flex-1', step > i + 1 ? 'bg-green-500' : 'bg-zinc-800')} />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <h2 data-animate className="text-lg font-semibold text-white mb-4">Escolha o serviço</h2>
          <div className="grid gap-3">
            {services.map(s => (
              <button
                key={s.id}
                data-scroll
                onClick={() => setSelectedService(s.id)}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border text-left transition-all',
                  selectedService === s.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5'
                )}
              >
                <div>
                  <p className="font-medium text-white">{s.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span className="text-xs text-zinc-400">{s.duration} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-bold">R$ {s.price}</span>
                  {selectedService === s.id && <CheckCircle className="w-5 h-5 text-amber-500" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <h2 data-animate className="text-lg font-semibold text-white mb-4">Escolha o profissional</h2>
          <div className="grid gap-3">
            {barbers.map(b => (
              <button
                key={b.id}
                data-scroll
                onClick={() => setSelectedBarber(b.id)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                  selectedBarber === b.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5'
                )}
              >
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center font-bold text-white', b.color)}>
                  {b.initials}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{b.name}</p>
                  <p className="text-sm text-zinc-400">{b.specialty}</p>
                </div>
                {selectedBarber === b.id && <CheckCircle className="w-5 h-5 text-amber-500" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <h2 data-animate className="text-lg font-semibold text-white mb-4">Escolha a data e horário</h2>
          <div data-animate className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => { setSelectedDay(i); setSelectedTime(null) }}
                className={cn(
                  'flex flex-col items-center px-4 py-3 rounded-xl border min-w-[72px] transition-all',
                  selectedDay === i
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-white/8 bg-white/3 text-zinc-400 hover:border-white/20'
                )}
              >
                <span className="text-xs">{DAYS[d.getDay()]}</span>
                <span className="text-xl font-bold text-white">{d.getDate()}</span>
                <span className="text-xs">{MONTHS[d.getMonth()]}</span>
              </button>
            ))}
          </div>
          <div data-scroll className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {times.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={cn(
                  'py-2.5 rounded-lg border text-sm font-medium transition-all',
                  selectedTime === t
                    ? 'border-amber-500 bg-amber-500 text-zinc-950'
                    : 'border-white/8 bg-white/3 text-zinc-300 hover:border-white/20'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div data-animate>
          <h2 className="text-lg font-semibold text-white mb-4">Confirmar agendamento</h2>
          <div className="bg-white/4 border border-white/8 rounded-xl p-6 space-y-4 backdrop-blur-sm">
            {[
              { label: 'Serviço', value: service?.name },
              { label: 'Profissional', value: barber?.name },
              {
                label: 'Data',
                value: `${DAYS[days[selectedDay].getDay()]}, ${days[selectedDay].getDate()} de ${MONTHS[days[selectedDay].getMonth()]}`
              },
              { label: 'Horário', value: selectedTime },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-3 border-b border-white/6">
                <span className="text-zinc-400">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-3">
              <span className="text-zinc-400">Valor</span>
              <span className="text-amber-400 font-bold text-lg">R$ {service?.price}</span>
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            className="mt-6 w-full py-3 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
          >
            Confirmar Agendamento
          </button>
        </div>
      )}

      {step < 4 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={next}
            disabled={!canProceed}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all',
              canProceed
                ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'
            )}
          >
            Continuar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
