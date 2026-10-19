-- Leads de la landing. Se escribe desde /api/leads con la clave anon: solo insert, nunca lectura.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  tipo text check (tipo in ('comercio', 'vecino')),
  fuente text not null default 'directo',
  consentimiento boolean not null check (consentimiento = true),
  fecha timestamptz default now()
);

alter table public.leads enable row level security;

create policy "anon puede insertar leads"
  on public.leads
  for insert
  to anon
  with check (true);
