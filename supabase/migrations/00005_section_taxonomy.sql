-- =============================================================================
-- SECTION TAXONOMY
-- =============================================================================
-- Canonical sections with per-supermarket mapping + user preference overrides.

-- 1. Supermarket Sections ------------------------------------------------------
-- Maps canonical sections to supermarket-specific section names and sort order.
create table if not exists supermarket_sections (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid not null references supermarkets(id) on delete cascade,
  canonical_section text not null,
  supermarket_section_name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(supermarket_id, canonical_section)
);

-- 2. User Section Preferences --------------------------------------------------
-- Remembers which section a user assigned to an ingredient for future lists.
create table if not exists user_section_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ingredient_id uuid references ingredients(id) on delete cascade,
  product_id uuid references supermarket_products(id) on delete cascade,
  section text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, ingredient_id, product_id)
);

-- 3. Add section to ingredients ------------------------------------------------
alter table ingredients add column if not exists section text;

-- 4. Add supermarket_section to supermarket_products ---------------------------
alter table supermarket_products add column if not exists supermarket_section text;

-- =============================================================================
-- RLS
-- =============================================================================

alter table supermarket_sections enable row level security;

create policy "Authenticated users can read supermarket sections"
  on supermarket_sections for select
  using (auth.role() = 'authenticated');

alter table user_section_preferences enable row level security;

create policy "Users can view own section preferences"
  on user_section_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own section preferences"
  on user_section_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own section preferences"
  on user_section_preferences for update
  using (auth.uid() = user_id);

create policy "Users can delete own section preferences"
  on user_section_preferences for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- TRIGGER: updated_at for user_section_preferences
-- =============================================================================

create trigger set_updated_at before update on user_section_preferences
  for each row execute function handle_updated_at();

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists idx_supermarket_sections_supermarket
  on supermarket_sections(supermarket_id, display_order);

create index if not exists idx_user_section_preferences_user
  on user_section_preferences(user_id);

-- =============================================================================
-- SEED: Mercadona section mapping
-- =============================================================================
-- Maps canonical sections to Mercadona's category names
insert into supermarket_sections (supermarket_id, canonical_section, supermarket_section_name, display_order) values
  ('a0000000-0000-0000-0000-000000000001', 'fruta-verdura',               'Frutas y Verduras',     1),
  ('a0000000-0000-0000-0000-000000000001', 'carne',                       'Carnicería',            2),
  ('a0000000-0000-0000-0000-000000000001', 'pescado',                     'Pescadería',            3),
  ('a0000000-0000-0000-0000-000000000001', 'charcuteria',                 'Charcutería',           4),
  ('a0000000-0000-0000-0000-000000000001', 'lacteos',                     'Lácteos',               5),
  ('a0000000-0000-0000-0000-000000000001', 'huevos',                      'Huevos',                6),
  ('a0000000-0000-0000-0000-000000000001', 'panaderia',                   'Panadería',             7),
  ('a0000000-0000-0000-0000-000000000001', 'despensa',                    'Despensa',              8),
  ('a0000000-0000-0000-0000-000000000001', 'pasta-arroz-legumbres',       'Pasta, arroz y legumbres', 9),
  ('a0000000-0000-0000-0000-000000000001', 'conservas',                   'Conservas',             10),
  ('a0000000-0000-0000-0000-000000000001', 'congelados',                  'Congelados',            11),
  ('a0000000-0000-0000-0000-000000000001', 'bebidas',                     'Bebidas',               12),
  ('a0000000-0000-0000-0000-000000000001', 'desayuno-dulces',             'Desayuno y dulces',     13),
  ('a0000000-0000-0000-0000-000000000001', 'limpieza',                    'Limpieza',              14),
  ('a0000000-0000-0000-0000-000000000001', 'higiene',                     'Higiene Personal',      15),
  ('a0000000-0000-0000-0000-000000000001', 'bebe',                        'Bebés',                 16),
  ('a0000000-0000-0000-0000-000000000001', 'mascotas',                    'Mascotas',              17),
  ('a0000000-0000-0000-0000-000000000001', 'otros',                       'Otros',                 18)
on conflict (supermarket_id, canonical_section) do nothing;

-- Update existing ingredients with canonical section labels
update ingredients set section = 'Fruta y verdura' where name in ('Tomate', 'Cebolla', 'Ajo', 'Pimiento Verde', 'Patata');
update ingredients set section = 'Carne' where name = 'Pollo';
update ingredients set section = 'Lácteos' where name = 'Leche';
update ingredients set section = 'Huevos' where name = 'Huevo';
update ingredients set section = 'Panadería' where name = 'Pan';
update ingredients set section = 'Despensa' where name in ('Arroz', 'Aceite de Oliva');
