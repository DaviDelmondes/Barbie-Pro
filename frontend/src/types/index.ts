export type UserRole = 'admin' | 'barber' | 'client'
export type AppointmentStatus = 'pending' | 'confirmed' | 'done' | 'cancelled'
export type TransactionType = 'income' | 'expense'

export interface Profile {
  id: string
  name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  specialty: string | null
  created_at: string
}

export interface Service {
  id: string
  name: string
  description: string | null
  duration_min: number
  price: number
  active: boolean
}

export interface BarberSchedule {
  id: string
  barber_id: string
  weekday: number
  start_time: string
  end_time: string
}

export interface Appointment {
  id: string
  client_id: string | null
  client_name: string | null
  client_phone: string | null
  barber_id: string
  service_id: string
  scheduled_at: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
}

export interface Transaction {
  id: string
  appointment_id: string | null
  amount: number
  type: TransactionType
  description: string | null
  commission_barber: number | null
  created_at: string
}
