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

-- ─── SEED DATA ──────────────────────────────────────────────
-- Sellers
insert into sellers (id, name, email, whatsapp, website, status, since_date, icon) values
  ('11111111-0000-0000-0000-000000000001', 'TechGear UK',  'portal@techgear.uk',    '+447700900123', 'techgear.uk',   'active', '2024-01-01', '📱'),
  ('11111111-0000-0000-0000-000000000002', 'StyleKart',    'accounts@stylekart.com', '+447700900124', 'stylekart.com', 'active', '2024-03-01', '👗'),
  ('11111111-0000-0000-0000-000000000003', 'FashionHub',   'finance@fashionhub.uk',  '+447700900125', 'fashionhub.uk', 'active', '2024-04-01', '👒'),
  ('11111111-0000-0000-0000-000000000004', 'GreenLife UK', 'billing@greenlife.uk',   '+447700900126', 'greenlife.uk',  'active', '2024-06-01', '🌿')
on conflict (id) do nothing;

-- Rate cards
insert into rate_cards (seller_id, labour_per_order, labour_extra_item, storage_per_pallet, returns_per_item, box_small, box_medium, bubble_wrap, label_full, label_print_only, insert_print, tissue_paper) values
  ('11111111-0000-0000-0000-000000000001', 2.50, 0.50, 8.00, 3.00, 1.50, 2.50, 0.40, 0.50, 0.20, 0.80, 0.30),
  ('11111111-0000-0000-0000-000000000002', 3.00, 0.50, 9.00, 3.50, 1.50, 2.50, 0.40, 0.60, 0.25, 1.00, 0.30),
  ('11111111-0000-0000-0000-000000000003', 2.80, 0.50, 8.50, 3.00, 1.50, 2.50, 0.40, 0.50, 0.20, 0.80, 0.25),
  ('11111111-0000-0000-0000-000000000004', 2.20, 0.40, 7.50, 2.50, 1.20, 2.20, 0.35, 0.40, 0.15, 0.70, 0.25)
on conflict (seller_id) do nothing;

-- Bank accounts
insert into bank_accounts (id, name, account_number_masked, account_type, icon, balance) values
  ('22222222-0000-0000-0000-000000000001', 'Lloyds Business',     '****4821', 'Business Current', '🏦', 24810.00),
  ('22222222-0000-0000-0000-000000000002', 'Barclays Operations', '****2294', 'Operations Account','🏛️', 8340.00),
  ('22222222-0000-0000-0000-000000000003', 'Petty Cash',          '—',        'Cash Float',        '💵', 150.00)
on conflict (id) do nothing;

-- Inventory
insert into inventory (seller_id, product_name, sku, variant, unit_price, boxes_in, units_per_box, total_in, damaged, good_stock, reserved, warehouse_location, condition, grn_ref) values
  ('11111111-0000-0000-0000-000000000001', 'USB-C Hub 7-Port',   'TG-USB7P-BLK',  'Black',    24.99, 7,  12, 84,  0, 84,  12, 'A3-R2-S4', 'complete', 'GRN-2026-031'),
  ('11111111-0000-0000-0000-000000000001', 'Wireless Mouse Pro', 'TG-WM-PRO',     null,       34.99, 1,  6,  6,   4, 2,   2,  'A3-R2-S5', 'partial',  'GRN-2026-032'),
  ('11111111-0000-0000-0000-000000000001', 'Laptop Stand',       'TG-LS-ALU',     'Aluminium',45.00, 4,  10, 40,  0, 38,  4,  'A3-R3-S1', 'complete', 'GRN-2026-033'),
  ('11111111-0000-0000-0000-000000000002', 'Summer Dress',       'SK-DRESS-RED-S', 'Red / S', 42.00, 2,  12, 24,  0, 24,  2,  'B2-R1-S3', 'complete', 'GRN-2026-034'),
  ('11111111-0000-0000-0000-000000000002', 'Summer Dress',       'SK-DRESS-RED-M', 'Red / M', 42.00, 2,  12, 24,  0, 24,  2,  'B2-R1-S4', 'complete', 'GRN-2026-034'),
  ('11111111-0000-0000-0000-000000000002', 'Summer Dress',       'SK-DRESS-BLU-M', 'Blue / M',42.00, 1,  12, 12,  0, 12,  1,  'B2-R1-S5', 'complete', 'GRN-2026-034'),
  ('11111111-0000-0000-0000-000000000003', 'Slim Fit Jeans',     'FH-JEANS-32',   'W32',      55.00, 2,  10, 20,  3, 17,  0,  'C1-R3-S2', 'partial',  'GRN-2026-035'),
  ('11111111-0000-0000-0000-000000000004', 'Eco Tote Bag',       'GL-ECO-BAGS',   'Pack of 5',12.50, 23, 10, 230, 0, 230, 20, 'D4-R1-S1', 'complete', 'GRN-2026-036')
on conflict (sku) do nothing;

-- Sample orders
insert into orders (id, order_number, seller_id, customer_name, customer_address, customer_postcode, carrier, status, priority, total_cost, created_at) values
  ('33333333-0000-0000-0000-000000000001', 'ORD-4829', '11111111-0000-0000-0000-000000000001', 'John Smith',  '42 Baker Street, London',    'W1U 6EJ', 'Royal Mail', 'pending',   'urgent', null, now() - interval '2 hours'),
  ('33333333-0000-0000-0000-000000000002', 'ORD-4828', '11111111-0000-0000-0000-000000000002', 'Sarah Jones', '10 Downing Street, London',   'SW1A 2AA','DPD',        'processing','high',   null, now() - interval '3 hours'),
  ('33333333-0000-0000-0000-000000000003', 'ORD-4827', '11111111-0000-0000-0000-000000000003', 'Ali Hassan',  '221B Baker Street, London',   'NW1 6XE', 'Evri',       'pending',   'normal', null, now() - interval '4 hours'),
  ('33333333-0000-0000-0000-000000000004', 'ORD-4821', '11111111-0000-0000-0000-000000000001', 'Emma White',  '1 Buckingham Palace Rd',      'SW1W 0PP','Royal Mail', 'dispatched','normal', 14.20, now() - interval '1 day'),
  ('33333333-0000-0000-0000-000000000005', 'ORD-4820', '11111111-0000-0000-0000-000000000004', 'Tom Brown',   '55 Water Lane, Manchester',   'M1 2AN',  'UPS',        'dispatched','normal', 9.80, now() - interval '2 days')
on conflict (order_number) do nothing;

-- Sample invoices
insert into invoices (id, invoice_number, seller_id, period_label, period_start, period_end, total_amount, paid_amount, status, due_date) values
  ('44444444-0000-0000-0000-000000000001', 'INV-2026-112', '11111111-0000-0000-0000-000000000001', 'April 2026', '2026-04-01', '2026-04-30', 2840.00, 0.00,    'overdue', '2026-04-25'),
  ('44444444-0000-0000-0000-000000000002', 'INV-2026-111', '11111111-0000-0000-0000-000000000002', 'April 2026', '2026-04-01', '2026-04-30', 1650.00, 0.00,    'pending', '2026-05-10'),
  ('44444444-0000-0000-0000-000000000003', 'INV-2026-110', '11111111-0000-0000-0000-000000000003', 'April 2026', '2026-04-01', '2026-04-30', 980.00,  980.00,  'paid',    '2026-05-05'),
  ('44444444-0000-0000-0000-000000000004', 'INV-2026-109', '11111111-0000-0000-0000-000000000004', 'April 2026', '2026-04-01', '2026-04-30', 720.00,  720.00,  'paid',    '2026-05-01')
on conflict (invoice_number) do nothing;

-- Sample transactions
insert into transactions (account_id, type, category, description, amount, seller_id, invoice_id, transaction_date) values
  ('22222222-0000-0000-0000-000000000001', 'in',  'Seller Payment',  'FashionHub — INV-2026-110',   980.00, '11111111-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003', '2026-05-04'),
  ('22222222-0000-0000-0000-000000000001', 'in',  'Seller Payment',  'GreenLife UK — INV-2026-109', 720.00, '11111111-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000004', '2026-05-02'),
  ('22222222-0000-0000-0000-000000000002', 'out', 'Rent',            'May warehouse rent',          1750.00, null, null, '2026-05-01'),
  ('22222222-0000-0000-0000-000000000001', 'out', 'Staff Wages',     'April payroll — 3 staff',     2800.00, null, null, '2026-05-01'),
  ('22222222-0000-0000-0000-000000000002', 'out', 'Utilities',       'Electric bill — May',         410.00, null, null, '2026-05-06'),
  ('22222222-0000-0000-0000-000000000001', 'in',  'Storage Revenue', 'Apr storage — StyleKart',     1440.00, '11111111-0000-0000-0000-000000000002', null, '2026-05-05');

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
