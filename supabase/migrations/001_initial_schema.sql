-- ============================================================
-- Klassical Fulfillment HUB — Initial Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── SELLERS ────────────────────────────────────────────────
create table if not exists sellers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text,
  whatsapp    text,
  website     text,
  status      text default 'active' check (status in ('active','inactive','suspended')),
  since_date  date,
  icon        text default '📦',
  created_at  timestamptz default now()
);

-- ─── RATE CARDS ─────────────────────────────────────────────
create table if not exists rate_cards (
  id                  uuid primary key default uuid_generate_v4(),
  seller_id           uuid references sellers(id) on delete cascade,
  labour_per_order    numeric(10,2) default 2.50,
  labour_extra_item   numeric(10,2) default 0.50,
  storage_per_pallet  numeric(10,2) default 8.00,
  returns_per_item    numeric(10,2) default 3.00,
  box_small           numeric(10,2) default 1.50,
  box_medium          numeric(10,2) default 2.50,
  bubble_wrap         numeric(10,2) default 0.40,
  label_full          numeric(10,2) default 0.50,
  label_print_only    numeric(10,2) default 0.20,
  insert_print        numeric(10,2) default 0.80,
  tissue_paper        numeric(10,2) default 0.30,
  effective_from      date default current_date,
  updated_at          timestamptz default now(),
  unique(seller_id)
);

-- ─── INVENTORY ──────────────────────────────────────────────
create table if not exists inventory (
  id                uuid primary key default uuid_generate_v4(),
  seller_id         uuid references sellers(id) on delete cascade,
  product_name      text not null,
  sku               text not null unique,
  variant           text,
  unit_price        numeric(10,2) default 0,
  boxes_in          int default 0,
  units_per_box     int default 1,
  total_in          int default 0,
  damaged           int default 0,
  good_stock        int default 0,
  reserved          int default 0,
  warehouse_location text,
  condition         text default 'complete' check (condition in ('complete','partial','damaged')),
  unit_of_measure   text default 'Each',
  grn_ref           text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ─── GOODS RECEIPT NOTES ────────────────────────────────────
create table if not exists grn (
  id              uuid primary key default uuid_generate_v4(),
  ref             text not null unique,
  seller_id       uuid references sellers(id),
  product_name    text,
  boxes           int,
  total_in        int,
  good_units      int,
  damaged_units   int default 0,
  condition       text default 'complete',
  notes           text,
  seller_notified boolean default false,
  received_date   date default current_date,
  created_at      timestamptz default now()
);

-- ─── ORDERS ─────────────────────────────────────────────────
create table if not exists orders (
  id               uuid primary key default uuid_generate_v4(),
  order_number     text not null unique,
  seller_id        uuid references sellers(id),
  customer_name    text,
  customer_address text,
  customer_postcode text,
  carrier          text default 'Royal Mail',
  tracking_number  text,
  status           text default 'pending' check (status in ('pending','processing','fulfilled','dispatched','cancelled')),
  priority         text default 'normal' check (priority in ('urgent','high','normal','low')),
  label_url        text,
  total_cost       numeric(10,2),
  notes            text,
  created_at       timestamptz default now(),
  fulfilled_at     timestamptz,
  dispatched_at    timestamptz
);

-- ─── ORDER ITEMS ────────────────────────────────────────────
create table if not exists order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid references orders(id) on delete cascade,
  inventory_id  uuid references inventory(id),
  sku           text,
  product_name  text,
  quantity      int default 1,
  unit_price    numeric(10,2) default 0,
  created_at    timestamptz default now()
);

-- ─── ORDER FULFILLMENT DETAILS ──────────────────────────────
create table if not exists order_fulfillment (
  id                    uuid primary key default uuid_generate_v4(),
  order_id              uuid references orders(id) on delete cascade unique,
  labour_charge         numeric(10,2) default 0,
  pack_config_extra     numeric(10,2) default 0,
  bubble_wrap           boolean default false,
  box_small             boolean default false,
  box_medium            boolean default false,
  label_type            text default 'none' check (label_type in ('none','full','print_only')),
  insert_print          boolean default false,
  tissue_paper          boolean default false,
  misc_charges          jsonb default '[]',
  product_price_override numeric(10,2),
  total_charge          numeric(10,2) default 0,
  created_at            timestamptz default now()
);

-- ─── INVOICES ───────────────────────────────────────────────
create table if not exists invoices (
  id              uuid primary key default uuid_generate_v4(),
  invoice_number  text not null unique,
  seller_id       uuid references sellers(id),
  period_start    date,
  period_end      date,
  period_label    text,
  subtotal        numeric(10,2) default 0,
  storage_charge  numeric(10,2) default 0,
  total_amount    numeric(10,2) default 0,
  paid_amount     numeric(10,2) default 0,
  status          text default 'pending' check (status in ('pending','sent','paid','overdue','partial')),
  due_date        date,
  reminders_sent  int default 0,
  last_reminder_at timestamptz,
  created_at      timestamptz default now()
);

-- ─── INVOICE LINE ITEMS ─────────────────────────────────────
create table if not exists invoice_items (
  id          uuid primary key default uuid_generate_v4(),
  invoice_id  uuid references invoices(id) on delete cascade,
  order_id    uuid references orders(id),
  description text,
  amount      numeric(10,2),
  item_type   text check (item_type in ('labour','packaging','label','storage','misc','product')),
  created_at  timestamptz default now()
);

-- ─── BANK ACCOUNTS ──────────────────────────────────────────
create table if not exists bank_accounts (
  id                   uuid primary key default uuid_generate_v4(),
  name                 text not null,
  account_number_masked text,
  account_type         text,
  icon                 text default '🏦',
  balance              numeric(12,2) default 0,
  created_at           timestamptz default now()
);

-- ─── TRANSACTIONS ───────────────────────────────────────────
create table if not exists transactions (
  id               uuid primary key default uuid_generate_v4(),
  account_id       uuid references bank_accounts(id),
  type             text check (type in ('in','out')),
  category         text,
  description      text,
  amount           numeric(10,2),
  seller_id        uuid references sellers(id),
  invoice_id       uuid references invoices(id),
  transaction_date date default current_date,
  created_at       timestamptz default now()
);

-- ─── STATEMENTS ─────────────────────────────────────────────
create table if not exists statements (
  id             uuid primary key default uuid_generate_v4(),
  ref            text not null unique,
  seller_id      uuid references sellers(id),
  period_label   text,
  period_start   date,
  period_end     date,
  total_charges  numeric(10,2) default 0,
  balance_due    numeric(10,2) default 0,
  sent_via       text[],
  sent_at        timestamptz,
  created_at     timestamptz default now()
);

-- ─── MESSAGES ───────────────────────────────────────────────
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  seller_id   uuid references sellers(id),
  sender_role text check (sender_role in ('warehouse','seller')),
  content     text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ─── REMINDER LOG ───────────────────────────────────────────
create table if not exists reminder_log (
  id          uuid primary key default uuid_generate_v4(),
  type        text,
  description text,
  seller_id   uuid references sellers(id),
  invoice_id  uuid references invoices(id),
  channels    text[],
  sent_at     timestamptz default now()
);

-- Seed data removed — use supabase/migrations/003_remove_seed_data.sql to clean existing databases

-- ─── REALTIME ───────────────────────────────────────────────
-- Enable row-level realtime for live updates
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table inventory;
alter publication supabase_realtime add table invoices;
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table messages;

-- ─── RLS POLICIES (basic — tighten per role in production) ──
alter table sellers       enable row level security;
alter table inventory     enable row level security;
alter table orders        enable row level security;
alter table invoices      enable row level security;
alter table transactions  enable row level security;
alter table messages      enable row level security;

-- Allow all authenticated users to read everything (lock down per role later)
create policy "auth_read_sellers"      on sellers      for all to authenticated using (true) with check (true);
create policy "auth_read_inventory"    on inventory     for all to authenticated using (true) with check (true);
create policy "auth_read_orders"       on orders        for all to authenticated using (true) with check (true);
create policy "auth_read_invoices"     on invoices      for all to authenticated using (true) with check (true);
create policy "auth_read_transactions" on transactions  for all to authenticated using (true) with check (true);
create policy "auth_read_messages"     on messages      for all to authenticated using (true) with check (true);
