-- =============================================================================
-- PRODUCT MATCHING SYSTEM
-- =============================================================================
-- Links generic ingredients to real supermarket products with confidence scoring.

-- 1. Ingredient-Product Matches ----------------------------------------------
-- Maps ingredients to supermarket products with confidence scoring.
create table if not exists ingredient_product_matches (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  product_id uuid not null references supermarket_products(id) on delete cascade,
  supermarket_id uuid not null references supermarkets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  confidence_score decimal(5,2) not null default 0 check (confidence_score >= 0 and confidence_score <= 100),
  match_type text not null default 'fuzzy' check (match_type in ('exact', 'fuzzy', 'manual', 'favorite')),
  is_user_preferred boolean not null default false,
  created_at timestamptz not null default now(),
  unique(ingredient_id, product_id, user_id)
);

-- 2. Add product_id and match_type to shopping_list_items --------------------
alter table shopping_list_items add column if not exists matched_product_id uuid references supermarket_products(id) on delete set null;
alter table shopping_list_items add column if not exists match_type text;

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists idx_ingredient_product_matches_ingredient
  on ingredient_product_matches(ingredient_id);
create index if not exists idx_ingredient_product_matches_product
  on ingredient_product_matches(product_id);
create index if not exists idx_ingredient_product_matches_user
  on ingredient_product_matches(user_id);
create index if not exists idx_ingredient_product_matches_supermarket
  on ingredient_product_matches(supermarket_id);

-- =============================================================================
-- RLS
-- =============================================================================

alter table ingredient_product_matches enable row level security;

create policy "Users can view matches"
  on ingredient_product_matches for select
  using (
    auth.uid() = user_id
    or user_id is null
  );

create policy "Users can insert own matches"
  on ingredient_product_matches for insert
  with check (auth.uid() = user_id);

create policy "Users can update own matches"
  on ingredient_product_matches for update
  using (auth.uid() = user_id);

create policy "Users can delete own matches"
  on ingredient_product_matches for delete
  using (auth.uid() = user_id);
