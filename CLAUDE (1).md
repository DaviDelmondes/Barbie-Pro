# CLAUDE.md — Barbie Pro

## Visão Geral do Projeto

**Barbie Pro** é um sistema de gestão para barbearia com agendamento online integrado.
O objetivo é oferecer uma plataforma completa para clientes agendarem serviços, barbeiros
gerenciarem sua agenda e o dono da barbearia ter controle financeiro e operacional.

-----

## Stack Tecnológica

|Camada      |Tecnologia                                |
|------------|------------------------------------------|
|Frontend    |React + TypeScript + Vite                 |
|Estilização |Tailwind CSS + shadcn/ui                  |
|Estado      |React Query (TanStack Query)              |
|Roteamento  |React Router DOM v6                       |
|Backend     |Node.js + Express                         |
|Banco       |Supabase (PostgreSQL)                     |
|Autenticação|Supabase Auth                             |
|Storage     |Supabase Storage (fotos dos profissionais)|
|Realtime    |Supabase Realtime (agenda ao vivo)        |

-----

## Estrutura de Pastas

```
barbie-pro/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.ts          # cliente Supabase configurado
│   │   ├── components/              # componentes reutilizáveis
│   │   ├── pages/
│   │   │   ├── Booking.tsx          # agendamento online (cliente)
│   │   │   ├── Calendar.tsx         # calendário por barbeiro
│   │   │   ├── Professionals.tsx    # perfil dos profissionais
│   │   │   ├── Clients.tsx          # histórico dos clientes
│   │   │   └── Financial.tsx        # controle financeiro
│   │   ├── hooks/                   # custom hooks (useAppointments, etc.)
│   │   ├── types/                   # tipos TypeScript compartilhados
│   │   └── App.tsx
│   ├── .env.local                   # variáveis de ambiente (nunca comitar)
│   └── vite.config.ts
├── backend/
│   └── src/
│       ├── routes/
│       │   ├── appointments.ts
│       │   ├── professionals.ts
│       │   ├── clients.ts
│       │   └── financial.ts
│       ├── services/               # lógica de negócio
│       └── index.ts
└── supabase/
    └── migrations/                 # versionamento do schema SQL
```

-----

## Módulos do Sistema

### 1. 🗓️ Agendamento Online (Booking)

- Cliente escolhe serviço → barbeiro → data/hora disponível
- Confirmação por e-mail (Supabase Auth trigger)
- Status: `pending` → `confirmed` → `done` | `cancelled`

### 2. 📅 Calendário

- Visão por barbeiro, por dia e por semana
- Atualização em tempo real via Supabase Realtime
- Bloqueio automático de horários já ocupados

### 3. 👤 Perfil dos Profissionais

- Nome, foto (Supabase Storage), especialidades
- Horário de trabalho por dia da semana
- Serviços que cada barbeiro realiza

### 4. 📋 Histórico de Clientes

- Lista de agendamentos anteriores
- Serviços realizados, barbeiro atendido, valor pago
- Preferências e observações

### 5. 💰 Controle Financeiro

- Receita por dia/semana/mês
- Comissão por barbeiro (percentual configurável)
- Registro de despesas da barbearia
- Relatório de caixa

-----

## Schema do Banco de Dados (Supabase)

```sql
-- Perfis (clientes, barbeiros, admin)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'barber', 'client')) DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Serviços oferecidos pela barbearia
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_min INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- Horários de trabalho dos barbeiros
CREATE TABLE barber_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES profiles(id),
  weekday INT CHECK (weekday BETWEEN 0 AND 6), -- 0=Dom, 6=Sáb
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

-- Agendamentos
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id),
  barber_id UUID REFERENCES profiles(id),
  service_id UUID REFERENCES services(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending','confirmed','done','cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Controle financeiro
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('income','expense')),
  description TEXT,
  commission_barber DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

-----

## Variáveis de Ambiente

```env
# frontend/.env.local
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# backend/.env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PORT=3333
```

> ⚠️ Nunca comitar `.env` ou `.env.local`. Já estão no `.gitignore`.

-----

## Convenções do Projeto

- **Idioma do código:** inglês (variáveis, funções, componentes)
- **Idioma da UI:** português brasileiro
- **Componentes:** funcionais com hooks, sem class components
- **Estilo:** Tailwind utility classes + shadcn/ui para componentes de UI
- **Tipos:** sempre tipar com TypeScript, sem `any`
- **Commits:** mensagens em português, no padrão `feat:`, `fix:`, `chore:`

-----

## Ordem de Desenvolvimento Sugerida

1. [ ] Setup do projeto (Vite + Tailwind + shadcn/ui)
1. [ ] Configurar Supabase (schema + auth)
1. [ ] Autenticação (login cliente / barbeiro / admin)
1. [ ] Cadastro de serviços e profissionais
1. [ ] Fluxo de agendamento (Booking)
1. [ ] Calendário dos barbeiros
1. [ ] Histórico de clientes
1. [ ] Módulo financeiro
1. [ ] Dashboard admin

-----

## Observações para o Claude Code

- Sempre usar o cliente Supabase de `src/lib/supabase.ts`
- Row Level Security (RLS) deve estar ativo em todas as tabelas
- Preferir React Query para chamadas ao Supabase no frontend
- O backend Node é usado apenas para lógica mais complexa (relatórios, webhooks)
- Ao criar novos componentes, seguir o padrão de pasta `/components/NomeDoModulo/`