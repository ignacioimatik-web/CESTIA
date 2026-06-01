-- Experimental supermarket catalog sync foundation (provider-agnostic)

create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid not null references supermarkets(id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(supermarket_id, name)
);

create table if not exists supermarket_products (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid not null references supermarkets(id) on delete cascade,
  name text not null,
  brand text,
  price decimal(10,2),
  unit text,
  quantity decimal(10,2),
  category_id uuid references product_categories(id) on delete set null,
  image_url text,
  ean text,
  is_seasonal boolean not null default false,
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table supermarket_products add column if not exists raw_data jsonb;
alter table supermarket_products add column if not exists image_url text;
alter table supermarket_products add column if not exists price decimal(10,2);
alter table supermarket_products add column if not exists unit_price decimal(10,4);
alter table supermarket_products add column if not exists package_size text;
alter table supermarket_products add column if not exists external_id text;
alter table supermarket_products add column if not exists external_category_id text;
alter table supermarket_products add column if not exists last_synced_at timestamptz;

create index if not exists idx_supermarket_products_external_id
  on supermarket_products(supermarket_id, external_id);

create table if not exists supermarket_sync_logs (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid references supermarkets(id) on delete set null,
  provider_name text not null,
  level text not null check (level in ('info', 'warn', 'error')),
  message text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table supermarket_sync_logs enable row level security;

create policy "Authenticated users can read supermarket sync logs"
  on supermarket_sync_logs for select
  using (auth.role() = 'authenticated');
