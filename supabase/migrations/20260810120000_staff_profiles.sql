-- Staff gate for Farwa admin CRM/POS.
-- Only rows in staff_profiles may open /admin (checked in Next.js proxy + RLS helpers).

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'front_desk')),
  display_name text,
  created_at timestamptz not null default now()
);

comment on table public.staff_profiles is
  'Salon staff allowed into /admin. Presence of a row = staff; role narrows privileges later.';

create index if not exists staff_profiles_role_idx on public.staff_profiles (role);

alter table public.staff_profiles enable row level security;

-- Security-definer helper so RLS policies (and future tables) can ask "is this
-- caller staff?" without recursion on staff_profiles itself.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_profiles
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_staff() to service_role;

-- Staff may read their own profile (middleware / shell use this).
create policy "staff_profiles_select_own"
  on public.staff_profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Staff may see other staff once they themselves are staff (team roster later).
create policy "staff_profiles_select_peers"
  on public.staff_profiles
  for select
  to authenticated
  using ((select public.is_staff()));

-- No insert/update/delete for authenticated clients — provision via service role
-- or SQL editor (see docs/admin-pos-setup.md).

grant select on public.staff_profiles to authenticated;
grant all on public.staff_profiles to service_role;
