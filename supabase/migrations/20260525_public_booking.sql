-- ─────────────────────────────────────────────────────────────────────────────
-- Barbie Pro — Supabase setup
-- Execute no Dashboard: https://supabase.com/dashboard → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Adiciona specialty nos perfis de barbeiros
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS specialty TEXT;

-- 2. Permite agendamentos anônimos (client_id opcional)
ALTER TABLE appointments
  ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS client_name  TEXT,
  ADD COLUMN IF NOT EXISTS client_phone TEXT;

-- ── RLS Policies ─────────────────────────────────────────────────────────────
-- Certifique-se que RLS está habilitado nas tabelas antes de criar as policies.
-- Dashboard → Table Editor → [tabela] → RLS → Enable RLS

CREATE POLICY "public read services" ON services
  FOR SELECT USING (true);

CREATE POLICY "public read barbers" ON profiles
  FOR SELECT USING (role = 'barber');

CREATE POLICY "public read schedules" ON barber_schedules
  FOR SELECT USING (true);

CREATE POLICY "public insert appointments" ON appointments
  FOR INSERT WITH CHECK (true);
