-- ============================================================
-- MiComunidad
-- Initial Core Schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type public.building_member_role as enum (
  'admin',
  'owner',
  'resident'
);

create type public.unit_member_role as enum (
  'owner',
  'resident'
);

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- BUILDINGS
-- ============================================================

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  rut text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- BUILDING MEMBERS
-- ============================================================

create table public.building_members (
  id uuid primary key default gen_random_uuid(),

  building_id uuid not null
    references public.buildings(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  role public.building_member_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),

  unique (building_id, user_id, role)
);

-- ============================================================
-- UNITS
-- ============================================================

create table public.units (
  id uuid primary key default gen_random_uuid(),

  building_id uuid not null
    references public.buildings(id)
    on delete cascade,

  unit_number text not null,
  floor text,

  proration numeric(8,5)
    check (
      proration is null
      or proration >= 0
    ),

  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (building_id, unit_number)
);

-- ============================================================
-- UNIT MEMBERS
-- ============================================================

create table public.unit_members (
  id uuid primary key default gen_random_uuid(),

  unit_id uuid not null
    references public.units(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  role public.unit_member_role not null,
  active boolean not null default true,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),

  constraint valid_membership_dates
    check (
      end_date is null
      or start_date is null
      or end_date >= start_date
    )
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_building_members_building
  on public.building_members(building_id);

create index idx_building_members_user
  on public.building_members(user_id);

create index idx_units_building
  on public.units(building_id);

create index idx_unit_members_unit
  on public.unit_members(unit_id);

create index idx_unit_members_user
  on public.unit_members(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_buildings_updated_at
before update on public.buildings
for each row
execute function public.set_updated_at();

create trigger set_units_updated_at
before update on public.units
for each row
execute function public.set_updated_at();

-- ============================================================
-- AUTOMATIC PROFILE CREATION
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      ''
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.buildings enable row level security;
alter table public.building_members enable row level security;
alter table public.units enable row level security;
alter table public.unit_members enable row level security;

-- ============================================================
-- PROFILE POLICIES
-- ============================================================

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
)
with check (
  auth.uid() = id
);