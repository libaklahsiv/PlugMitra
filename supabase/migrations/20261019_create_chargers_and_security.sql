-- ============================================================================
-- PlugMitra Chennai EV Charging Platform - Supabase Database Schema & Security
-- Migration: 20261019_create_chargers_and_security.sql
-- Hardened Security Edition: Strict RLS, Database Triggers, Residential Privacy Shield
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
  select coalesce(
    (select role = 'admin' from public.profiles where id = user_id),
    false
  );
$$;

-- Trigger to automatically create profile row on user signup (strictly 'user' role)
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
    'user' -- Always defaults to 'user', never trust client metadata
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Database-level trigger to strictly prevent users from self-elevating their role
create or replace function public.enforce_profile_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Prevent ordinary users from self-elevating to admin or host roles
  if (NEW.role is distinct from OLD.role) and not public.is_admin(auth.uid()) then
    raise exception 'Unauthorized: Only platform administrators can modify user roles.';
  end if;

  -- Prevent primary key mutation
  if (NEW.id is distinct from OLD.id) then
    raise exception 'Unauthorized: Profile identifier cannot be changed.';
  end if;

  return NEW;
end;
$$;

drop trigger if exists tr_enforce_profile_security on public.profiles;
create trigger tr_enforce_profile_security
  before update on public.profiles
  for each row execute procedure public.enforce_profile_security();

-- Profiles RLS Policies:
drop policy if exists "Public profiles are viewable by authenticated users" on public.profiles;
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update their own profile without self-elevating role" on public.profiles;
create policy "Users can update their own profile without self-elevating role"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
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
  latitude double precision not null check (latitude between 12.0 and 14.0),
  longitude double precision not null check (longitude between 79.0 and 81.0),
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
  is_active boolean not null default true,
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


-- 3. UNBYPASSABLE DATABASE TRIGGERS FOR CHARGERS TABLE
-- Enforce that inserts are always owned by auth.uid() and start as 'pending'
create or replace function public.enforce_charger_insert_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Force owner_id to current authenticated user
  if auth.uid() is not null then
    NEW.owner_id := auth.uid();
  end if;

  -- Non-administrators can NEVER insert approved chargers
  if not public.is_admin(auth.uid()) then
    NEW.status := 'pending';
    NEW.data_source := 'community';
    NEW.source_record_id := null;
  end if;

  return NEW;
end;
$$;

drop trigger if exists tr_enforce_charger_insert_security on public.chargers;
create trigger tr_enforce_charger_insert_security
  before insert on public.chargers
  for each row execute procedure public.enforce_charger_insert_security();

-- Enforce that status changes and ownership reassignments are strictly restricted to admins
create or replace function public.enforce_charger_update_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Prevent non-admins from altering approval status
  if (NEW.status is distinct from OLD.status) and not public.is_admin(auth.uid()) then
    raise exception 'Unauthorized: Only platform administrators can change listing approval status.';
  end if;

  -- Prevent non-admins from transferring ownership
  if (NEW.owner_id is distinct from OLD.owner_id) and not public.is_admin(auth.uid()) then
    raise exception 'Unauthorized: Charger ownership cannot be transferred.';
  end if;

  -- Prevent non-admins from altering data_source
  if (NEW.data_source is distinct from OLD.data_source) and not public.is_admin(auth.uid()) then
    NEW.data_source := OLD.data_source;
  end if;

  return NEW;
end;
$$;

drop trigger if exists tr_enforce_charger_update_security on public.chargers;
create trigger tr_enforce_charger_update_security
  before update on public.chargers
  for each row execute procedure public.enforce_charger_update_security();


-- 4. ROW LEVEL SECURITY (RLS) FOR CHARGERS TABLE
alter table public.chargers enable row level security;

-- Revoke raw table access from anon; anonymous users must only query v_public_chargers
revoke all on public.chargers from anon;
grant select, insert, update, delete on public.chargers to authenticated;

-- Direct table select:
-- To prevent leakage of private residential addresses and gate instructions via raw table queries,
-- raw table SELECT is limited to the listing owner, administrators, and imported public utility stations.
-- Public discovery is served strictly through the sanitized view public.v_public_chargers.
drop policy if exists "Anyone can view approved chargers and owners can view their own" on public.chargers;
drop policy if exists "Owners and admins can view chargers directly" on public.chargers;
create policy "Owners and admins can view chargers directly"
  on public.chargers for select
  to authenticated
  using (
    auth.uid() = owner_id
    or public.is_admin(auth.uid())
    or (data_source = 'imported' and status = 'approved')
  );

-- Insert policy: Authenticated users can submit chargers
drop policy if exists "Authenticated users can submit chargers with pending status" on public.chargers;
create policy "Authenticated users can submit chargers with pending status"
  on public.chargers for insert
  to authenticated
  with check (
    auth.uid() = owner_id
  );

-- Update policy: Owners can update their own listings; Admins can update any listing
drop policy if exists "Owners can update their own chargers without changing approval status" on public.chargers;
create policy "Owners and admins can update chargers"
  on public.chargers for update
  to authenticated
  using (
    auth.uid() = owner_id
    or public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = owner_id
    or public.is_admin(auth.uid())
  );

-- Delete policy: Owners can delete their own listings; Admins can delete any listing
drop policy if exists "Owners and admins can delete chargers" on public.chargers;
create policy "Owners and admins can delete chargers"
  on public.chargers for delete
  to authenticated
  using (
    auth.uid() = owner_id
    or public.is_admin(auth.uid())
  );


-- 5. RESIDENTIAL PRIVACY SHIELD VIEW (v_public_chargers)
-- Accessible by both anonymous and authenticated drivers.
-- Automatically masks private residential addresses, parking bay numbers, and gate codes.
-- Fuzzes private residential GPS coordinates to ~100m radius (3 decimal places) to protect exact homes.
-- Strips sensitive private photos from the public response array.
create or replace view public.v_public_chargers
with (security_barrier = true) as
select
  id,
  owner_id,
  name,
  property_name,
  -- Mask door/flat number if private residential access and viewer is not owner/admin
  case
    when access_type = 'private'
         and (auth.uid() is null or (auth.uid() != owner_id and not public.is_admin(auth.uid())))
    then '[Exact residential address hidden for privacy]'
    else address
  end as address,
  landmark,
  area,
  city,
  pincode,
  -- Coordinate privacy: fuzz to 3 decimal places (~100m) for private residential chargers
  case
    when access_type = 'private'
         and (auth.uid() is null or (auth.uid() != owner_id and not public.is_admin(auth.uid())))
    then round(latitude::numeric, 3)::double precision
    else latitude
  end as latitude,
  case
    when access_type = 'private'
         and (auth.uid() is null or (auth.uid() != owner_id and not public.is_admin(auth.uid())))
    then round(longitude::numeric, 3)::double precision
    else longitude
  end as longitude,
  access_type,
  connector_types,
  power_output_kw,
  power_type,
  is_covered_parking,
  -- Mask parking slot number for private residential listings
  case
    when access_type = 'private'
         and (auth.uid() is null or (auth.uid() != owner_id and not public.is_admin(auth.uid())))
    then '[Reserved Residential Bay - Host provides slot upon arrival]'
    else parking_slot_number
  end as parking_slot_number,
  is_free,
  price_per_kwh,
  parking_fee_per_hour,
  operating_hours,
  -- Mask sensitive private gate instructions
  case
    when access_type = 'private'
         and (auth.uid() is null or (auth.uid() != owner_id and not public.is_admin(auth.uid())))
    then '[Protected by Residential Privacy Shield. Full access instructions unlocked upon confirmed booking.]'
    else access_instructions
  end as access_instructions,
  -- Sanitize photo paths: strip private access photos from public array
  case
    when access_type = 'private'
         and (auth.uid() is null or (auth.uid() != owner_id and not public.is_admin(auth.uid())))
    then array(
      select p from unnest(photo_paths) as p where p not like '%/private/%'
    )
    else photo_paths
  end as photo_paths,
  status,
  is_active,
  data_source,
  source_record_id,
  created_at,
  updated_at
from public.chargers
where
  (status = 'approved' and is_active = true)
  or (auth.uid() is not null and auth.uid() = owner_id)
  or (auth.uid() is not null and public.is_admin(auth.uid()));

-- Grant read privileges on the privacy view to both anonymous and authenticated roles
grant select on public.v_public_chargers to anon, authenticated;


-- 6. PHOTO STORAGE BUCKET & FOLDER ACCESS SECURITY
-- Bucket: charger-photos (configured as private so storage RLS is strictly enforced)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'charger-photos',
  'charger-photos',
  false,
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Storage RLS Policies:
-- 1. Public photos (under <userId>/public/*) are viewable by anyone
drop policy if exists "Charger photos are publicly viewable" on storage.objects;
drop policy if exists "Public charger photos viewable by everyone" on storage.objects;
create policy "Public charger photos viewable by everyone"
  on storage.objects for select
  using (
    bucket_id = 'charger-photos'
    and (storage.foldername(name))[2] = 'public'
  );

-- 2. Private photos (under <userId>/private/*) can ONLY be viewed by the uploading host or admin
drop policy if exists "Private charger photos only viewable by owner or admin" on storage.objects;
create policy "Private charger photos only viewable by owner or admin"
  on storage.objects for select
  using (
    bucket_id = 'charger-photos'
    and (storage.foldername(name))[2] = 'private'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin(auth.uid())
    )
  );

-- 3. Authenticated hosts can upload photos only into their designated user folder
drop policy if exists "Authenticated users can upload charger photos to their folder" on storage.objects;
create policy "Authenticated users can upload charger photos to their folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'charger-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and (storage.foldername(name))[2] in ('public', 'private')
  );

-- 4. Hosts can delete their own uploaded photos
drop policy if exists "Users can delete their own charger photos" on storage.objects;
create policy "Users can delete their own charger photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'charger-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin(auth.uid())
    )
  );

-- 7. SAVED CHARGERS (DRIVER BOOKMARKS) TABLE
create table if not exists public.saved_chargers (
  user_id uuid not null references auth.users(id) on delete cascade,
  charger_id uuid not null references public.chargers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, charger_id)
);

alter table public.saved_chargers enable row level security;
grant select, insert, delete on public.saved_chargers to authenticated;

drop policy if exists "Users can view their own saved chargers" on public.saved_chargers;
create policy "Users can view their own saved chargers"
  on public.saved_chargers for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can save chargers for themselves" on public.saved_chargers;
create policy "Users can save chargers for themselves"
  on public.saved_chargers for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own saved chargers" on public.saved_chargers;
create policy "Users can remove their own saved chargers"
  on public.saved_chargers for delete
  to authenticated
  using (auth.uid() = user_id);

-- 8. BOOKINGS TABLE
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  charger_id uuid not null references public.chargers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  driver_name text not null,
  driver_phone text not null,
  vehicle_details text not null,
  arrival_time text not null,
  duration_hours numeric not null default 1 check (duration_hours > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  total_estimate numeric not null default 0 check (total_estimate >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
grant select, insert, update, delete on public.bookings to authenticated;

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.update_updated_at_column();

drop policy if exists "Users can view their own bookings or bookings on their chargers" on public.bookings;
create policy "Users can view their own bookings or bookings on their chargers"
  on public.bookings for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.chargers c
      where c.id = bookings.charger_id and c.owner_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

drop policy if exists "Users can create bookings for themselves" on public.bookings;
create policy "Users can create bookings for themselves"
  on public.bookings for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users and hosts can update their respective bookings" on public.bookings;
create policy "Users and hosts can update their respective bookings"
  on public.bookings for update
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.chargers c
      where c.id = bookings.charger_id and c.owner_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

drop policy if exists "Users can cancel or delete their own bookings" on public.bookings;
create policy "Users can cancel or delete their own bookings"
  on public.bookings for delete
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin(auth.uid())
  );

