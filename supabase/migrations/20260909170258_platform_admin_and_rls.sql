-- ============================================================
-- MiComunidad
-- Platform Admin + Multi-tenant RLS
-- ============================================================


-- ============================================================
-- PLATFORM ADMINS
-- ============================================================

create table public.platform_admins (
  user_id uuid primary key
    references public.profiles(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  created_by uuid
    references public.profiles(id)
    on delete set null
);


alter table public.platform_admins
enable row level security;


-- ============================================================
-- SECURITY HELPER FUNCTIONS
-- ============================================================


-- Is current user a MiComunidad platform administrator?
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins
    where user_id = auth.uid()
  );
$$;


-- Does current user belong to this building?
create or replace function public.is_building_member(
  target_building_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.building_members
      where building_id = target_building_id
        and user_id = auth.uid()
        and active = true
    );
$$;


-- Is current user an administrator of this building?
create or replace function public.is_building_admin(
  target_building_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.building_members
      where building_id = target_building_id
        and user_id = auth.uid()
        and role = 'admin'
        and active = true
    );
$$;


-- Does current user belong to this unit?
create or replace function public.is_unit_member(
  target_unit_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.unit_members
    where unit_id = target_unit_id
      and user_id = auth.uid()
      and active = true
  );
$$;


-- Can current user administer this unit?
create or replace function public.is_unit_admin(
  target_unit_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()
    or exists (
      select 1
      from public.units u
      join public.building_members bm
        on bm.building_id = u.building_id
      where u.id = target_unit_id
        and bm.user_id = auth.uid()
        and bm.role = 'admin'
        and bm.active = true
    );
$$;


-- Can current user see this profile because they administer
-- one of the user's buildings?
create or replace function public.can_administer_profile(
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin()

    or exists (
      select 1
      from public.building_members target_member
      join public.building_members current_admin
        on current_admin.building_id = target_member.building_id
      where target_member.user_id = target_user_id
        and target_member.active = true
        and current_admin.user_id = auth.uid()
        and current_admin.role = 'admin'
        and current_admin.active = true
    )

    or exists (
      select 1
      from public.unit_members target_unit_member
      join public.units u
        on u.id = target_unit_member.unit_id
      join public.building_members current_admin
        on current_admin.building_id = u.building_id
      where target_unit_member.user_id = target_user_id
        and target_unit_member.active = true
        and current_admin.user_id = auth.uid()
        and current_admin.role = 'admin'
        and current_admin.active = true
    );
$$;


-- ============================================================
-- FUNCTION PERMISSIONS
-- ============================================================

revoke all on function public.is_platform_admin() from public;
revoke all on function public.is_building_member(uuid) from public;
revoke all on function public.is_building_admin(uuid) from public;
revoke all on function public.is_unit_member(uuid) from public;
revoke all on function public.is_unit_admin(uuid) from public;
revoke all on function public.can_administer_profile(uuid) from public;


grant execute on function public.is_platform_admin()
to authenticated;

grant execute on function public.is_building_member(uuid)
to authenticated;

grant execute on function public.is_building_admin(uuid)
to authenticated;

grant execute on function public.is_unit_member(uuid)
to authenticated;

grant execute on function public.is_unit_admin(uuid)
to authenticated;

grant execute on function public.can_administer_profile(uuid)
to authenticated;


-- ============================================================
-- PLATFORM ADMIN POLICIES
-- ============================================================

create policy "Platform admins can read platform admins"
on public.platform_admins
for select
to authenticated
using (
  public.is_platform_admin()
);


-- ============================================================
-- PROFILE POLICIES
-- ============================================================

-- The initial migration already allows users to read themselves.

create policy "Building admins can read managed profiles"
on public.profiles
for select
to authenticated
using (
  public.can_administer_profile(id)
);


create policy "Platform admins can update profiles"
on public.profiles
for update
to authenticated
using (
  public.is_platform_admin()
)
with check (
  public.is_platform_admin()
);


-- ============================================================
-- BUILDINGS
-- ============================================================

create policy "Members can read their buildings"
on public.buildings
for select
to authenticated
using (
  public.is_building_member(id)
);


create policy "Platform admins can create buildings"
on public.buildings
for insert
to authenticated
with check (
  public.is_platform_admin()
);


create policy "Building admins can update buildings"
on public.buildings
for update
to authenticated
using (
  public.is_building_admin(id)
)
with check (
  public.is_building_admin(id)
);


create policy "Platform admins can delete buildings"
on public.buildings
for delete
to authenticated
using (
  public.is_platform_admin()
);


-- ============================================================
-- BUILDING MEMBERS
-- ============================================================

create policy "Users can read own building memberships"
on public.building_members
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_building_admin(building_id)
);


create policy "Building admins can add members"
on public.building_members
for insert
to authenticated
with check (
  public.is_building_admin(building_id)
);


create policy "Building admins can update members"
on public.building_members
for update
to authenticated
using (
  public.is_building_admin(building_id)
)
with check (
  public.is_building_admin(building_id)
);


create policy "Building admins can remove members"
on public.building_members
for delete
to authenticated
using (
  public.is_building_admin(building_id)
);


-- ============================================================
-- UNITS
-- ============================================================

create policy "Users can read accessible units"
on public.units
for select
to authenticated
using (
  public.is_platform_admin()
  or public.is_building_admin(building_id)
  or public.is_unit_member(id)
);


create policy "Building admins can create units"
on public.units
for insert
to authenticated
with check (
  public.is_building_admin(building_id)
);


create policy "Building admins can update units"
on public.units
for update
to authenticated
using (
  public.is_building_admin(building_id)
)
with check (
  public.is_building_admin(building_id)
);


create policy "Building admins can delete units"
on public.units
for delete
to authenticated
using (
  public.is_building_admin(building_id)
);


-- ============================================================
-- UNIT MEMBERS
-- ============================================================

create policy "Users can read own unit memberships"
on public.unit_members
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_unit_admin(unit_id)
);


create policy "Building admins can add unit members"
on public.unit_members
for insert
to authenticated
with check (
  public.is_unit_admin(unit_id)
);


create policy "Building admins can update unit members"
on public.unit_members
for update
to authenticated
using (
  public.is_unit_admin(unit_id)
)
with check (
  public.is_unit_admin(unit_id)
);


create policy "Building admins can remove unit members"
on public.unit_members
for delete
to authenticated
using (
  public.is_unit_admin(unit_id)
);