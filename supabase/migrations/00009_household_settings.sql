-- =============================================================================
-- HOUSEHOLD / FAMILY MODE
-- =============================================================================

-- 1. Extend households --------------------------------------------------------
alter table households add column if not exists adults int not null default 2;
alter table households add column if not exists young_children int not null default 0;
alter table households add column if not exists teenagers int not null default 0;
alter table households add column if not exists frequent_guests int not null default 0;
alter table households add column if not exists weekly_budget decimal(10,2);
alter table households add column if not exists primary_supermarket_id uuid references supermarkets(id) on delete set null;
alter table households add column if not exists dietary_restrictions text[] not null default '{}';
alter table households add column if not exists preferences text[] not null default '{}';

-- 2. Household favorite recipes -----------------------------------------------
create table if not exists household_favorite_recipes (
  household_id uuid not null references households(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (household_id, recipe_id)
);

-- 3. Household usual products --------------------------------------------------
-- Frequently bought products (e.g. weekly essentials)
create table if not exists household_usual_products (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  product_id uuid references supermarket_products(id) on delete set null,
  name text not null,
  quantity decimal(10,2),
  unit text not null default 'ud',
  frequency text not null default 'weekly' check (frequency in ('weekly', 'biweekly', 'monthly')),
  section text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 4. Recurring shopping lists -------------------------------------------------
create table if not exists recurring_shopping_lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  items jsonb not null default '[]',
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly')),
  day_of_week int check (day_of_week between 0 and 6),
  is_active boolean not null default true,
  last_generated_at timestamptz,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists idx_household_favorite_recipes_household
  on household_favorite_recipes(household_id);
create index if not exists idx_household_usual_products_household
  on household_usual_products(household_id);
create index if not exists idx_recurring_lists_household
  on recurring_shopping_lists(household_id);
create index if not exists idx_households_primary_supermarket
  on households(primary_supermarket_id);

-- =============================================================================
-- RLS
-- =============================================================================

alter table household_favorite_recipes enable row level security;
alter table household_usual_products enable row level security;
alter table recurring_shopping_lists enable row level security;

-- Favorite recipes
create policy "Members can view favorites"
  on household_favorite_recipes for select
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = household_favorite_recipes.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can insert favorites"
  on household_favorite_recipes for insert
  with check (
    exists (
      select 1 from household_members
      where household_members.household_id = household_favorite_recipes.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can delete favorites"
  on household_favorite_recipes for delete
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = household_favorite_recipes.household_id
      and household_members.user_id = auth.uid()
    )
  );

-- Usual products
create policy "Members can view usual products"
  on household_usual_products for select
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = household_usual_products.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can manage usual products"
  on household_usual_products for insert
  with check (
    exists (
      select 1 from household_members
      where household_members.household_id = household_usual_products.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can update usual products"
  on household_usual_products for update
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = household_usual_products.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can delete usual products"
  on household_usual_products for delete
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = household_usual_products.household_id
      and household_members.user_id = auth.uid()
    )
  );

-- Recurring lists
create policy "Members can view recurring lists"
  on recurring_shopping_lists for select
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = recurring_shopping_lists.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can manage recurring lists"
  on recurring_shopping_lists for insert
  with check (
    exists (
      select 1 from household_members
      where household_members.household_id = recurring_shopping_lists.household_id
      and household_members.user_id = auth.uid()
    )
  );
