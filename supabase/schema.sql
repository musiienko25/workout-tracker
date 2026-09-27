create table if not exists public.workouts (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  date date not null,
  created_at timestamptz not null default timezone('utc', now()),
  type text not null,
  completed boolean not null default false,
  exercises jsonb not null default '[]'::jsonb,
  primary key (user_id, id)
);

create index if not exists workouts_user_date_idx
  on public.workouts (user_id, date desc, created_at desc);

alter table public.workouts enable row level security;

drop policy if exists "Users manage their own workouts" on public.workouts;

create policy "Users manage their own workouts"
  on public.workouts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
