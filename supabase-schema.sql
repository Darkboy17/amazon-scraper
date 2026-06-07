create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.scrapes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  keyword text not null,
  use_proxy boolean not null default false,
  result_count integer not null default 0,
  duration_ms integer not null default 0,
  products jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists scrapes_user_created_at_idx
  on public.scrapes (user_id, created_at desc);

alter table public.user_profiles enable row level security;
alter table public.scrapes enable row level security;

drop policy if exists "Users can read their own profile" on public.user_profiles;
create policy "Users can read their own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can read their own scrapes" on public.scrapes;
create policy "Users can read their own scrapes"
  on public.scrapes
  for select
  using (auth.uid() = user_id);
