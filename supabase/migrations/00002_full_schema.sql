-- =============================================================================
-- CESTA INTELIGENTE — Full Schema with Row Level Security
-- =============================================================================
-- Migration: 00002_full_schema
-- Description: Complete database schema with 16 tables, RLS, triggers, indexes

-- 0. Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- 1. Profiles -----------------------------------------------------------------
-- Extiende la información del usuario auth.users de Supabase
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Supermarkets -------------------------------------------------------------
-- Catálogo de supermercados disponibles
create table if not exists supermarkets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  logo_url text,
  color text,
  website text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Product Categories -------------------------------------------------------
-- Secciones/departamentos de cada supermercado (frutería, carnicería, etc.)
create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid not null references supermarkets(id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(supermarket_id, name)
);

-- 4. Supermarket Products -----------------------------------------------------
-- Productos individuales de cada supermercado con precio e información
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

-- 5. Households ---------------------------------------------------------------
-- Grupos familiares/compartidos
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Household Members --------------------------------------------------------
-- Relación usuario-hogar con rol
create table if not exists household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique(household_id, user_id)
);

-- 7. Ingredients --------------------------------------------------------------
-- Catálogo maestro de ingredientes
create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  image_url text,
  created_at timestamptz not null default now()
);

-- 8. Product-Ingredient Matches -----------------------------------------------
-- Relaciona productos de supermercado con ingredientes del catálogo
create table if not exists product_ingredient_matches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references supermarket_products(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  match_type text not null default 'exact' check (match_type in ('exact', 'synonym', 'category')),
  created_at timestamptz not null default now(),
  unique(product_id, ingredient_id)
);

-- 9. Recipes ------------------------------------------------------------------
-- Recetas creadas por usuarios
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  base_servings integer not null default 4,
  prep_time_minutes integer,
  cook_time_minutes integer,
  instructions text,
  tags text[] not null default '{}',
  is_public boolean not null default false,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. Recipe Ingredients ------------------------------------------------------
-- Ingredientes específicos de cada receta con cantidad y unidad
create table if not exists recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  quantity decimal(10,2) not null,
  unit text not null,
  optional boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- 11. Shopping Lists ----------------------------------------------------------
-- Listas de compra asociadas a un hogar
create table if not exists shopping_lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  notes text,
  is_completed boolean not null default false,
  supermarket_id uuid references supermarkets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. Shopping List Items -----------------------------------------------------
-- Productos individuales dentro de una lista de compra
create table if not exists shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references shopping_lists(id) on delete cascade,
  product_id uuid references supermarket_products(id) on delete set null,
  recipe_id uuid references recipes(id) on delete set null,
  name text not null,
  quantity decimal(10,2) not null,
  unit text not null,
  is_checked boolean not null default false,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 13. Meal Plans --------------------------------------------------------------
-- Planificación semanal de comidas
create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete set null,
  name text,
  week_start date not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 14. Meal Plan Items ---------------------------------------------------------
-- Comidas planificadas para un día específico
create table if not exists meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references meal_plans(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete set null,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  servings integer not null default 4,
  created_at timestamptz not null default now()
);

-- 15. Events ------------------------------------------------------------------
-- Auditoría de eventos del usuario
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- 16. User Preferences --------------------------------------------------------
-- Preferencias individuales de cada usuario
create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  dietary_preferences text[] not null default '{}',
  favorite_supermarket_id uuid references supermarkets(id) on delete set null,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  language text not null default 'es' check (language in ('es', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Profiles
create index if not exists idx_profiles_created_at on profiles(created_at);

-- Supermarkets
create index if not exists idx_supermarkets_enabled on supermarkets(enabled);

-- Product Categories
create index if not exists idx_product_categories_supermarket on product_categories(supermarket_id, display_order);

-- Supermarket Products
create index if not exists idx_supermarket_products_supermarket on supermarket_products(supermarket_id);
create index if not exists idx_supermarket_products_category on supermarket_products(category_id);
create index if not exists idx_supermarket_products_name on supermarket_products(name);
create index if not exists idx_supermarket_products_ean on supermarket_products(ean) where ean is not null;

-- Product-Ingredient Matches
create index if not exists idx_product_ingredient_matches_product on product_ingredient_matches(product_id);
create index if not exists idx_product_ingredient_matches_ingredient on product_ingredient_matches(ingredient_id);

-- Household Members
create index if not exists idx_household_members_household on household_members(household_id);
create index if not exists idx_household_members_user on household_members(user_id);

-- Recipes
create index if not exists idx_recipes_household on recipes(household_id);
create index if not exists idx_recipes_created_by on recipes(created_by);
create index if not exists idx_recipes_public on recipes(is_public) where is_public = true;
create index if not exists idx_recipes_favorite on recipes(is_favorite) where is_favorite = true;
create index if not exists idx_recipes_tags on recipes using gin(tags);
create index if not exists idx_recipes_created_at on recipes(created_at desc);

-- Recipe Ingredients
create index if not exists idx_recipe_ingredients_recipe on recipe_ingredients(recipe_id);
create index if not exists idx_recipe_ingredients_ingredient on recipe_ingredients(ingredient_id);

-- Shopping Lists
create index if not exists idx_shopping_lists_household on shopping_lists(household_id);
create index if not exists idx_shopping_lists_created_by on shopping_lists(created_by);
create index if not exists idx_shopping_lists_completed on shopping_lists(is_completed);

-- Shopping List Items
create index if not exists idx_shopping_list_items_list on shopping_list_items(shopping_list_id);
create index if not exists idx_shopping_list_items_product on shopping_list_items(product_id) where product_id is not null;

-- Meal Plans
create index if not exists idx_meal_plans_household on meal_plans(household_id);
create index if not exists idx_meal_plans_week on meal_plans(week_start);

-- Meal Plan Items
create index if not exists idx_meal_plan_items_plan on meal_plan_items(meal_plan_id);
create index if not exists idx_meal_plan_items_date on meal_plan_items(date);

-- Events
create index if not exists idx_events_user on events(user_id, created_at desc);
create index if not exists idx_events_type on events(event_type);

-- User Preferences
create index if not exists idx_user_preferences_user on user_preferences(user_id);

-- =============================================================================
-- TRIGGERS: updated_at
-- =============================================================================

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles',
    'supermarkets',
    'supermarket_products',
    'households',
    'recipes',
    'shopping_lists',
    'meal_plans',
    'user_preferences'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on %I for each row execute function handle_updated_at()',
      t
    );
  end loop;
end;
$$;

-- =============================================================================
-- TRIGGERS: auto-create profile on signup
-- =============================================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =========================================================================----

-- Profiles: cada usuario gestiona su propio perfil
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Supermarkets: todos los autenticados pueden leer; solo admins modifican (reservado)
alter table supermarkets enable row level security;

create policy "Authenticated users can read supermarkets"
  on supermarkets for select
  using (auth.role() = 'authenticated');

-- Nota: Solo admins pueden insert/update/delete supermarkets.
-- Se implementará cuando haya roles de administrador.

-- Product Categories: lectura para todos los autenticados
alter table product_categories enable row level security;

create policy "Authenticated users can read product categories"
  on product_categories for select
  using (auth.role() = 'authenticated');

-- Supermarket Products: lectura para todos los autenticados
alter table supermarket_products enable row level security;

create policy "Authenticated users can read supermarket products"
  on supermarket_products for select
  using (auth.role() = 'authenticated');

-- Product-Ingredient Matches: lectura para todos los autenticados
alter table product_ingredient_matches enable row level security;

create policy "Authenticated users can read product ingredient matches"
  on product_ingredient_matches for select
  using (auth.role() = 'authenticated');

-- Households: miembros del hogar pueden leer; admins del hogar pueden modificar
alter table households enable row level security;

create policy "Members can view households"
  on households for select
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = households.id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Admins can update households"
  on households for update
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = households.id
      and household_members.user_id = auth.uid()
      and household_members.role = 'admin'
    )
  );

-- Household Members: visibilidad para miembros del hogar
alter table household_members enable row level security;

create policy "Members can view household members"
  on household_members for select
  using (
    exists (
      select 1 from household_members hm
      where hm.household_id = household_members.household_id
      and hm.user_id = auth.uid()
    )
  );

create policy "Admins can manage household members"
  on household_members for insert
  with check (
    exists (
      select 1 from household_members hm
      where hm.household_id = household_members.household_id
      and hm.user_id = auth.uid()
      and hm.role = 'admin'
    )
  );

create policy "Admins can update household members"
  on household_members for update
  using (
    exists (
      select 1 from household_members hm
      where hm.household_id = household_members.household_id
      and hm.user_id = auth.uid()
      and hm.role = 'admin'
    )
  );

create policy "Users can delete own membership"
  on household_members for delete
  using (auth.uid() = user_id);

-- Recipes: públicas lectura para todos; privadas solo para creador/miembros del hogar
alter table recipes enable row level security;

create policy "Anyone can read public recipes"
  on recipes for select
  using (
    is_public = true
    or
    auth.uid() = created_by
    or
    exists (
      select 1 from household_members
      where household_members.household_id = recipes.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Users can create recipes"
  on recipes for insert
  with check (auth.uid() = created_by);

create policy "Users can update own recipes"
  on recipes for update
  using (auth.uid() = created_by);

create policy "Users can delete own recipes"
  on recipes for delete
  using (auth.uid() = created_by);

-- Ingredients: todos los autenticados pueden leer; solo admins modifican
alter table ingredients enable row level security;

create policy "Authenticated users can read ingredients"
  on ingredients for select
  using (auth.role() = 'authenticated');

-- Recipe Ingredients: acceso vía receta padre
alter table recipe_ingredients enable row level security;

create policy "Users can read recipe ingredients via recipe"
  on recipe_ingredients for select
  using (
    exists (
      select 1 from recipes
      where recipes.id = recipe_ingredients.recipe_id
      and (
        recipes.is_public = true
        or recipes.created_by = auth.uid()
        or exists (
          select 1 from household_members
          where household_members.household_id = recipes.household_id
          and household_members.user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can manage own recipe ingredients"
  on recipe_ingredients for insert
  with check (
    exists (
      select 1 from recipes
      where recipes.id = recipe_ingredients.recipe_id
      and recipes.created_by = auth.uid()
    )
  );

create policy "Users can update own recipe ingredients"
  on recipe_ingredients for update
  using (
    exists (
      select 1 from recipes
      where recipes.id = recipe_ingredients.recipe_id
      and recipes.created_by = auth.uid()
    )
  );

create policy "Users can delete own recipe ingredients"
  on recipe_ingredients for delete
  using (
    exists (
      select 1 from recipes
      where recipes.id = recipe_ingredients.recipe_id
      and recipes.created_by = auth.uid()
    )
  );

-- Shopping Lists: acceso para miembros del hogar y creador
alter table shopping_lists enable row level security;

create policy "Members can view shopping lists"
  on shopping_lists for select
  using (
    auth.uid() = created_by
    or
    exists (
      select 1 from household_members
      where household_members.household_id = shopping_lists.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Users can create shopping lists"
  on shopping_lists for insert
  with check (auth.uid() = created_by);

create policy "Users can update own shopping lists"
  on shopping_lists for update
  using (auth.uid() = created_by);

create policy "Users can delete own shopping lists"
  on shopping_lists for delete
  using (auth.uid() = created_by);

-- Shopping List Items: acceso vía lista padre
alter table shopping_list_items enable row level security;

create policy "Users can view items via shopping list"
  on shopping_list_items for select
  using (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = shopping_list_items.shopping_list_id
      and (
        shopping_lists.created_by = auth.uid()
        or exists (
          select 1 from household_members
          where household_members.household_id = shopping_lists.household_id
          and household_members.user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can manage items in own lists"
  on shopping_list_items for insert
  with check (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = shopping_list_items.shopping_list_id
      and shopping_lists.created_by = auth.uid()
    )
  );

create policy "Users can update items in own lists"
  on shopping_list_items for update
  using (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = shopping_list_items.shopping_list_id
      and shopping_lists.created_by = auth.uid()
    )
  );

create policy "Users can delete items from own lists"
  on shopping_list_items for delete
  using (
    exists (
      select 1 from shopping_lists
      where shopping_lists.id = shopping_list_items.shopping_list_id
      and shopping_lists.created_by = auth.uid()
    )
  );

-- Meal Plans: acceso para miembros del hogar
alter table meal_plans enable row level security;

create policy "Members can view meal plans"
  on meal_plans for select
  using (
    auth.uid() = created_by
    or
    exists (
      select 1 from household_members
      where household_members.household_id = meal_plans.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Users can create meal plans"
  on meal_plans for insert
  with check (auth.uid() = created_by);

create policy "Users can update own meal plans"
  on meal_plans for update
  using (auth.uid() = created_by);

create policy "Users can delete own meal plans"
  on meal_plans for delete
  using (auth.uid() = created_by);

-- Meal Plan Items: acceso vía plan padre
alter table meal_plan_items enable row level security;

create policy "Users can view items via meal plan"
  on meal_plan_items for select
  using (
    exists (
      select 1 from meal_plans
      where meal_plans.id = meal_plan_items.meal_plan_id
      and (
        meal_plans.created_by = auth.uid()
        or exists (
          select 1 from household_members
          where household_members.household_id = meal_plans.household_id
          and household_members.user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can manage items in own plans"
  on meal_plan_items for insert
  with check (
    exists (
      select 1 from meal_plans
      where meal_plans.id = meal_plan_items.meal_plan_id
      and meal_plans.created_by = auth.uid()
    )
  );

create policy "Users can update items in own plans"
  on meal_plan_items for update
  using (
    exists (
      select 1 from meal_plans
      where meal_plans.id = meal_plan_items.meal_plan_id
      and meal_plans.created_by = auth.uid()
    )
  );

create policy "Users can delete items from own plans"
  on meal_plan_items for delete
  using (
    exists (
      select 1 from meal_plans
      where meal_plans.id = meal_plan_items.meal_plan_id
      and meal_plans.created_by = auth.uid()
    )
  );

-- Events: cada usuario ve solo sus propios eventos
alter table events enable row level security;

create policy "Users can view own events"
  on events for select
  using (auth.uid() = user_id);

create policy "Users can create own events"
  on events for insert
  with check (auth.uid() = user_id);

-- User Preferences: cada usuario gestiona sus preferencias
alter table user_preferences enable row level security;

create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can upsert own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);
