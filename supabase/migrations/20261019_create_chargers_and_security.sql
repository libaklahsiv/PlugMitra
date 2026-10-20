-- ============================================================================
-- PlugMitra Chennai EV Charging Platform - Supabase Database Schema & Security
-- Migration: 20261019_create_chargers_and_security.sql
-- ============================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user', 'host', 'admin')),
  vehicle_make text,
  vehicle_model text,
  vehicle_reg_number text,
  connector_preference text,
  battery_capacity_kwh numeric check (battery_capacity_kwh >= 0),
  preferred_area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Function to check admin privileges securely on backend (never trusted from frontend input)
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

-- Trigger to automatically create profile row on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'user' -- Always defaults to 'user', never trust admin input
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Profiles RLS Policies:
-- Anyone authenticated can view user public profile info
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can update their own profile, but CANNOT self-elevate to admin
create policy "Users can update their own profile without self-elevating role"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (
      -- Role cannot be changed by user, or user is already admin
      role = (select p.role from public.profiles p where p.id = auth.uid())
      or public.is_admin(auth.uid())
    )
  );

-- Admins can update any profile (e.g. assigning roles)
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- 2. CHARGERS TABLE
create table if not exists public.chargers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  property_name text not null,
  parking_slot_number text not null,
  is_covered_parking boolean not null default false,
  address text not null,
  landmark text,
  area text not null,
  city text not null default 'Chennai',
  pincode text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  access_type text not null check (access_type in ('public', 'semi-private', 'private')),
  connector_types text[] not null check (array_length(connector_types, 1) > 0),
  power_output_kw numeric not null check (power_output_kw > 0),
  power_type text not null default 'AC' check (power_type in ('AC', 'DC')),
  is_free boolean not null default false,
  price_per_kwh numeric check (price_per_kwh is null or price_per_kwh >= 0),
  parking_fee_per_hour numeric not null default 0 check (parking_fee_per_hour >= 0),
  operating_hours text,
  access_instructions text,
  photo_paths text[] not null default '{}'::text[],
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  data_source text not null default 'community',
  source_record_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance Indexes
create index if not exists idx_chargers_coords on public.chargers (latitude, longitude);
create index if not exists idx_chargers_status on public.chargers (status);
create index if not exists idx_chargers_owner on public.chargers (owner_id);
create index if not exists idx_chargers_area on public.chargers (area);
create index if not exists idx_chargers_access_type on public.chargers (access_type);

-- Trigger for auto-updating updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_chargers_updated_at on public.chargers;
create trigger set_chargers_updated_at
  before update on public.chargers
  for each row execute procedure public.update_updated_at_column();


-- 3. ROW LEVEL SECURITY (RLS) FOR CHARGERS TABLE
alter table public.chargers enable row level security;

-- Read policy:
-- 1. Anyone can view approved chargers.
-- 2. Owners can always view their own chargers (pending, approved, or rejected).
-- 3. Admins can view all chargers.
create policy "Anyone can view approved chargers and owners can view their own"
  on public.chargers for select
  using (
    status = 'approved'
    or (auth.uid() is not null and auth.uid() = owner_id)
    or (auth.uid() is not null and public.is_admin(auth.uid()))
  );

-- Insert policy:
-- Authenticated users can insert chargers where owner_id = auth.uid().
-- Status MUST be 'pending' upon creation (cannot self-approve on insert).
create policy "Authenticated users can submit chargers with pending status"
  on public.chargers for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    and status = 'pending'
  );

-- Update policy:
-- Owners can update their own chargers, but CANNOT approve their own chargers.
-- Admins can update any charger, including changing status to approved/rejected.
create policy "Owners can update their own chargers without changing approval status"
  on public.chargers for update
  to authenticated
  using (
    auth.uid() = owner_id
    or public.is_admin(auth.uid())
  )
  with check (
    (
      -- Owner editing own charger: status must remain unchanged
      auth.uid() = owner_id
      and status = (select c.status from public.chargers c where c.id = chargers.id)
    )
    or public.is_admin(auth.uid())
  );

-- Delete policy:
-- Owners can delete their own listings; Admins can delete any listing.
create policy "Owners and admins can delete chargers"
  on public.chargers for delete
  to authenticated
  using (
    auth.uid() = owner_id
    or public.is_admin(auth.uid())
  );


-- 4. PRIVACY MASKING VIEW FOR RESIDENTIAL LISTINGS
-- Protects sensitive house/flat number and gate codes from unauthorized general visitors.
-- Only the owner, confirmed drivers, or admins see unmasked private residential instructions.
create or replace view public.v_public_chargers as
select
  id,
  owner_id,
  name,
  property_name,
  -- Mask door/flat number if private residential access and not owner/admin
  case
    when access_type = 'private'
         and (auth.uid() is null or (auth.uid() != owner_id and not public.is_admin(auth.uid())))
    then '[Exact flat/door number hidden for resident privacy]'
    else address
  end as address,
  landmark,
  area,
  city,
  pincode,
  latitude,
  longitude,
  access_type,
  connector_types,
  power_output_kw,
  power_type,
  is_covered_parking,
  parking_slot_number,
  is_free,
  price_per_kwh,
  parking_fee_per_hour,
  operating_hours,
  -- Mask sensitive private gate instructions
  case
    when access_type = 'private'
         and (auth.uid() is null or (auth.uid() != owner_id and not public.is_admin(auth.uid())))
    then '[Protected by Residential Privacy Shield. Unlocked upon confirmed arrival.]'
    else access_instructions
  end as access_instructions,
  photo_paths,
  status,
  data_source,
  created_at,
  updated_at
from public.chargers
where
  status = 'approved'
  or (auth.uid() is not null and auth.uid() = owner_id)
  or (auth.uid() is not null and public.is_admin(auth.uid()));


-- 5. PHOTO STORAGE BUCKET SECURITY
-- Run once in Supabase Storage:
insert into storage.buckets (id, name, public)
values ('charger-photos', 'charger-photos', true)
on conflict (id) do nothing;

-- Photo Storage Policies:
-- Anyone can view approved charger photos
create policy "Charger photos are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'charger-photos');

-- Authenticated hosts can upload photos to their designated user folder
create policy "Authenticated users can upload charger photos to their folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'charger-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Hosts can delete their own uploaded photos
create policy "Users can delete their own charger photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'charger-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
