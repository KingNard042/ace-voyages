create table if not exists public.admin_users (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text,
  role            text not null check (role in ('super_admin','manager_admin','agent_admin')),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy if not exists "Admins can read own record"
  on public.admin_users for select
  using (auth.uid() = auth_user_id);
