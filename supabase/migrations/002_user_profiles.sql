-- ============================================================
-- Migration 002: User Profiles
-- Run in Supabase SQL Editor → Dashboard → SQL Editor
-- ============================================================

-- User profiles — links auth.users to roles and seller accounts
create table if not exists user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null default 'warehouse_staff'
                check (role in ('admin','warehouse_manager','warehouse_staff','seller')),
  seller_id   uuid references sellers(id) on delete set null,
  status      text not null default 'active'
                check (status in ('active','inactive')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table user_profiles enable row level security;

-- Any authenticated user can read all profiles (internal app)
create policy "profiles_read_authenticated"
  on user_profiles for select
  to authenticated
  using (true);

-- Only admins can insert / update / delete profiles
create policy "profiles_write_admin"
  on user_profiles for all
  to authenticated
  using (
    (select role from user_profiles where id = auth.uid()) = 'admin'
  )
  with check (
    (select role from user_profiles where id = auth.uid()) = 'admin'
  );

-- Users can update their own profile (name only — not role)
create policy "profiles_update_own"
  on user_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
