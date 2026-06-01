-- Cesta Inteligente - Esquema completo de base de datos
-- PostgreSQL + Supabase

-- Enums
CREATE TYPE household_role AS ENUM ('admin', 'member');
CREATE TYPE dietary_preference AS ENUM ('none', 'vegetarian', 'vegan', 'gluten_free', 'lactose_free', 'low_carb', 'keto', 'mediterranean');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE unit_type AS ENUM ('g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'unit', 'slice', 'clove', 'pack', 'can', 'bunch', 'piece');
CREATE TYPE supermarket_name AS ENUM ('mercadona', 'lidl', 'aldi', 'dia', 'carrefour', 'consum', 'family_cash');

-- Tables
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  adults INTEGER NOT NULL DEFAULT 2,
  children INTEGER NOT NULL DEFAULT 0,
  favorite_supermarket supermarket_name,
  dietary_preferences dietary_preference[] NOT NULL DEFAULT '{none}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role household_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  base_servings INTEGER NOT NULL DEFAULT 4,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  instructions TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit unit_type NOT NULL DEFAULT 'unit',
  optional BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  supermarket_section_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  supermarket supermarket_name,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit unit_type NOT NULL DEFAULT 'unit',
  is_checked BOOLEAN NOT NULL DEFAULT false,
  supermarket_section_id UUID,
  category TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE supermarket_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supermarket supermarket_name NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(supermarket, name)
);

CREATE TABLE supermarket_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supermarket supermarket_name NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(10, 2),
  unit unit_type NOT NULL DEFAULT 'unit',
  quantity DECIMAL(10, 2),
  category TEXT,
  section_id UUID REFERENCES supermarket_sections(id) ON DELETE SET NULL,
  image_url TEXT,
  ean TEXT,
  is_seasonal BOOLEAN NOT NULL DEFAULT false,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type meal_type NOT NULL DEFAULT 'lunch',
  servings INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, recipe_id, date, meal_type)
);

-- Indexes
CREATE INDEX idx_household_members_user ON household_members(user_id);
CREATE INDEX idx_household_members_household ON household_members(household_id);
CREATE INDEX idx_recipes_household ON recipes(household_id);
CREATE INDEX idx_recipes_created_by ON recipes(created_by);
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_shopping_lists_household ON shopping_lists(household_id);
CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_shopping_list_items_recipe ON shopping_list_items(recipe_id);
CREATE INDEX idx_supermarket_products_supermarket ON supermarket_products(supermarket);
CREATE INDEX idx_supermarket_products_section ON supermarket_products(section_id);
CREATE INDEX idx_supermarket_products_ean ON supermarket_products(ean);
CREATE INDEX idx_supermarket_products_name ON supermarket_products USING gin(name gin_trgm_ops);
CREATE INDEX idx_meal_plans_household ON meal_plans(household_id);
CREATE INDEX idx_meal_plans_date ON meal_plans(date);

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER households_updated_at
  BEFORE UPDATE ON households FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER supermarket_products_updated_at
  BEFORE UPDATE ON supermarket_products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermarket_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermarket_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Households: admins and members can read, only admins can update
CREATE POLICY "households_read" ON households
  FOR SELECT USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "households_insert" ON households
  FOR INSERT WITH CHECK (true);

CREATE POLICY "households_update" ON households
  FOR UPDATE USING (
    id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Household members: members can read, admins can manage
CREATE POLICY "members_read" ON household_members
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "members_insert" ON household_members
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "members_delete" ON household_members
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Recipes: CRUD for household members
CREATE POLICY "recipes_read" ON recipes
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "recipes_insert" ON recipes
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "recipes_update" ON recipes
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "recipes_delete" ON recipes
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Recipe ingredients: inherited from recipes
CREATE POLICY "ingredients_read" ON recipe_ingredients
  FOR SELECT USING (
    recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "ingredients_insert" ON recipe_ingredients
  FOR INSERT WITH CHECK (
    recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "ingredients_update" ON recipe_ingredients
  FOR UPDATE USING (
    recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "ingredients_delete" ON recipe_ingredients
  FOR DELETE USING (
    recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()))
  );

-- Shopping lists: household members
CREATE POLICY "lists_read" ON shopping_lists
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "lists_insert" ON shopping_lists
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "lists_update" ON shopping_lists
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "lists_delete" ON shopping_lists
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Shopping list items: through shopping lists
CREATE POLICY "items_read" ON shopping_list_items
  FOR SELECT USING (
    shopping_list_id IN (SELECT id FROM shopping_lists WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "items_insert" ON shopping_list_items
  FOR INSERT WITH CHECK (
    shopping_list_id IN (SELECT id FROM shopping_lists WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "items_update" ON shopping_list_items
  FOR UPDATE USING (
    shopping_list_id IN (SELECT id FROM shopping_lists WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "items_delete" ON shopping_list_items
  FOR DELETE USING (
    shopping_list_id IN (SELECT id FROM shopping_lists WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()))
  );

-- Supermarket sections: public read
CREATE POLICY "sections_read" ON supermarket_sections
  FOR SELECT USING (true);

-- Supermarket products: public read
CREATE POLICY "products_read" ON supermarket_products
  FOR SELECT USING (true);

-- Meal plans: household members
CREATE POLICY "plans_read" ON meal_plans
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "plans_insert" ON meal_plans
  FOR INSERT WITH CHECK (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "plans_update" ON meal_plans
  FOR UPDATE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "plans_delete" ON meal_plans
  FOR DELETE USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );
