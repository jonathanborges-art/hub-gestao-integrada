-- Schema do Hub Gestão Integrada — Postgres (Supabase)
-- Multi-tenant: toda tabela de dados de clínica tem clinic_id.
-- Este arquivo é só para referência/reprodução; a fonte da verdade roda no projeto Supabase.

create extension if not exists pgcrypto;

create table clinics (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  endereco text,
  telefone text,
  whatsapp text,
  logo_url text,
  cor_primaria text default '#017A5B',
  meta_faturamento_mensal numeric default 0,
  plano text default 'Gratuito',
  ativo boolean default true,
  created_at timestamptz default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade, -- null = conta Master
  nome text not null,
  email text unique not null,
  password_hash text not null,
  perfil text not null default 'Administrador', -- Administrador | Recepção | Médico | Financeiro | Master
  ativo boolean default true,
  created_at timestamptz default now()
);

create table professionals (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  nome text not null,
  especialidade text,
  comissao_percentual numeric default 0,
  cor text default '#017A5B',
  ativo boolean default true,
  email text,
  telefone text
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  nome text not null,
  foto_url text,
  data_nascimento date,
  cpf text,
  telefone text,
  email text,
  endereco text,
  convenio text,
  tags text[] default '{}',
  lgpd_aceite boolean default false,
  lgpd_data date,
  ativo boolean default true,
  created_at timestamptz default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  paciente_id uuid references patients(id) on delete set null,
  profissional_id uuid references professionals(id) on delete set null,
  data date not null,
  hora_inicio text not null,
  duracao_minutos int default 30,
  tipo text,
  status text default 'agendado',
  valor numeric default 0,
  observacoes text,
  created_at timestamptz default now()
);

create table financial_transactions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  tipo text not null, -- receita | despesa
  categoria text,
  descricao text,
  valor numeric default 0,
  data date not null,
  status text default 'pendente', -- pendente | pago
  forma_pagamento text,
  profissional_id uuid references professionals(id) on delete set null
);

create table clinical_records (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  paciente_id uuid references patients(id) on delete cascade,
  profissional_id uuid references professionals(id) on delete set null,
  data date not null,
  evolucao text
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  nome text not null,
  telefone text,
  origem text,
  criado_em timestamptz default now(),
  agendou boolean default false,
  compareceu boolean default false,
  propos boolean default false,
  fechou boolean default false,
  valor_fechado numeric default 0
);

create table traffic_daily (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  data date not null,
  visitantes int default 0,
  leads_gerados int default 0,
  conversoes int default 0
);

create table marketing_spend (
  clinic_id uuid references clinics(id) on delete cascade,
  mes text not null,
  total numeric default 0,
  por_canal jsonb default '{}',
  primary key (clinic_id, mes)
);

create table comercial_activities (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  hora text,
  tipo text,
  com text,
  status text default 'agendado'
);

create table metas_comerciais (
  clinic_id uuid primary key references clinics(id) on delete cascade,
  leads_alvo int default 0,
  agendamentos_alvo int default 0,
  vendas_alvo int default 0,
  faturamento_alvo numeric default 0,
  cac_alvo numeric default 0
);

-- Notificações enviadas pelo painel Master, exibidas como banner no Dashboard das clínicas
create table notifications (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mensagem text not null,
  criado_por uuid references users(id),
  created_at timestamptz default now(),
  ativa boolean default true
);

create index idx_users_clinic on users(clinic_id);
create index idx_patients_clinic on patients(clinic_id);
create index idx_appointments_clinic on appointments(clinic_id);
create index idx_financial_clinic on financial_transactions(clinic_id);
create index idx_leads_clinic on leads(clinic_id);

-- Recomendado (não obrigatório, já que o backend usa uma conexão que ignora RLS):
-- alter table <cada tabela acima> enable row level security;
-- Isso fecha o acesso via API pública do Supabase (PostgREST) para quem só tem a anon key.
