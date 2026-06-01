-- =============================================================================
-- MEAL EVENTS MODULE
-- =============================================================================

-- 1. Meal Events -------------------------------------------------------------
-- Social/meal events with guest counts, date, and associated recipes/products.
create table if not exists meal_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  name text not null,
  event_type text not null check (event_type in (
    'birthday', 'family_dinner', 'romantic_dinner', 'bbq',
    'casual_dinner', 'sports_meal', 'weekly_menu',
    'batch_cooking', 'christmas', 'kids_snack'
  )),
  date date not null,
  adults int not null default 2,
  children int not null default 0,
  notes text,
  is_template boolean not null default false,
  template_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Event Recipes -----------------------------------------------------------
-- Recipes associated with an event, with custom serving count.
create table if not exists meal_event_recipes (
  id uuid primary key default gen_random_uuid(),
  meal_event_id uuid not null references meal_events(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  servings int not null,
  sort_order int not null default 0
);

-- 3. Event Extra Products ----------------------------------------------------
-- Manual products not linked to any recipe.
create table if not exists meal_event_extra_products (
  id uuid primary key default gen_random_uuid(),
  meal_event_id uuid not null references meal_events(id) on delete cascade,
  name text not null,
  quantity decimal(10,2) not null default 1,
  unit text not null default 'ud',
  section text,
  notes text,
  sort_order int not null default 0
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index if not exists idx_meal_events_household
  on meal_events(household_id);
create index if not exists idx_meal_events_date
  on meal_events(date);
create index if not exists idx_meal_events_type
  on meal_events(event_type);
create index if not exists idx_meal_event_recipes_event
  on meal_event_recipes(meal_event_id);
create index if not exists idx_meal_event_extra_products_event
  on meal_event_extra_products(meal_event_id);

-- =============================================================================
-- RLS
-- =============================================================================

alter table meal_events enable row level security;
alter table meal_event_recipes enable row level security;
alter table meal_event_extra_products enable row level security;

-- Meal events
create policy "Members can view events"
  on meal_events for select
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = meal_events.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can create events"
  on meal_events for insert
  with check (
    exists (
      select 1 from household_members
      where household_members.household_id = meal_events.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can update events"
  on meal_events for update
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = meal_events.household_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can delete events"
  on meal_events for delete
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = meal_events.household_id
      and household_members.user_id = auth.uid()
    )
  );

-- Event recipes
create policy "Members can view event recipes"
  on meal_event_recipes for select
  using (
    exists (
      select 1 from meal_events
      join household_members on household_members.household_id = meal_events.household_id
      where meal_events.id = meal_event_recipes.meal_event_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can manage event recipes"
  on meal_event_recipes for insert
  with check (
    exists (
      select 1 from meal_events
      join household_members on household_members.household_id = meal_events.household_id
      where meal_events.id = meal_event_recipes.meal_event_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can delete event recipes"
  on meal_event_recipes for delete
  using (
    exists (
      select 1 from meal_events
      join household_members on household_members.household_id = meal_events.household_id
      where meal_events.id = meal_event_recipes.meal_event_id
      and household_members.user_id = auth.uid()
    )
  );

-- Event extra products
create policy "Members can view extra products"
  on meal_event_extra_products for select
  using (
    exists (
      select 1 from meal_events
      join household_members on household_members.household_id = meal_events.household_id
      where meal_events.id = meal_event_extra_products.meal_event_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can manage extra products"
  on meal_event_extra_products for insert
  with check (
    exists (
      select 1 from meal_events
      join household_members on household_members.household_id = meal_events.household_id
      where meal_events.id = meal_event_extra_products.meal_event_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can update extra products"
  on meal_event_extra_products for update
  using (
    exists (
      select 1 from meal_events
      join household_members on household_members.household_id = meal_events.household_id
      where meal_events.id = meal_event_extra_products.meal_event_id
      and household_members.user_id = auth.uid()
    )
  );

create policy "Members can delete extra products"
  on meal_event_extra_products for delete
  using (
    exists (
      select 1 from meal_events
      join household_members on household_members.household_id = meal_events.household_id
      where meal_events.id = meal_event_extra_products.meal_event_id
      and household_members.user_id = auth.uid()
    )
  );
