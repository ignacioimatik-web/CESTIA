-- Migration 00001: Schema inicial
-- Aplica el esquema completo de la base de datos

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
CREATE INDEX idx_meal_plans_household ON meal_plans(household_id);
CREATE INDEX idx_meal_plans_date ON meal_plans(date);

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Triggers
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
