-- ============================================================
-- MiComunidad
-- Member Management Support
-- ============================================================


-- ============================================================
-- PROFILE EMAIL
-- ============================================================

alter table public.profiles
add column if not exists email text;


-- Backfill existing users

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;


-- Auth emails should already be unique, but this also protects
-- the application-level profiles table.

create unique index if not exists profiles_email_lower_unique
on public.profiles (lower(email))
where email is not null;


-- ============================================================
-- PREVENT DUPLICATED UNIT MEMBERSHIPS
-- ============================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'unit_members_unique_user_role'
  ) then

    alter table public.unit_members
    add constraint unit_members_unique_user_role
    unique (unit_id, user_id, role);

  end if;
end
$$;


-- ============================================================
-- SYNCHRONIZE AUTH USER → PROFILE
-- ============================================================

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.profiles (
    id,
    full_name,
    phone,
    email
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      ''
    ),
    new.raw_user_meta_data ->> 'phone',
    new.email
  )

  on conflict (id)
  do update set

    email = excluded.email,

    full_name = case
      when excluded.full_name <> ''
        then excluded.full_name
      else public.profiles.full_name
    end,

    phone = coalesce(
      excluded.phone,
      public.profiles.phone
    ),

    updated_at = now();

  return new;

end;
$$;


-- Replace old insert trigger

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.sync_auth_user_profile();


-- Synchronize future email / metadata changes

drop trigger if exists on_auth_user_profile_updated
on auth.users;

create trigger on_auth_user_profile_updated
after update of email, raw_user_meta_data
on auth.users
for each row
execute function public.sync_auth_user_profile();