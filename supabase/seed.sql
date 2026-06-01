-- Seed data for Cesta Inteligente
-- Requires: auth.users must exist before running this

-- Seed household (for development)
INSERT INTO households (id, name, adults, children, favorite_supermarket, dietary_preferences)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Hogar de Desarrollo', 2, 1, 'mercadona', '{none}');

-- Seed supermarket sections
INSERT INTO supermarket_sections (supermarket, name, display_order) VALUES
  ('mercadona', 'Frutas y Verduras', 1),
  ('mercadona', 'Carnes y Pescados', 2),
  ('mercadona', 'Huevos y Lácteos', 3),
  ('mercadona', 'Panadería', 4),
  ('mercadona', 'Despensa', 5),
  ('mercadona', 'Bebidas', 6),
  ('mercadona', 'Congelados', 7),
  ('mercadona', 'Limpieza', 8),
  ('mercadona', 'Higiene Personal', 9),
  ('mercadona', 'Bebés', 10),
  ('mercadona', 'Mascotas', 11),
  ('mercadona', 'Otros', 12);

-- Seed recipes
INSERT INTO recipes (id, household_id, created_by, name, description, base_servings, prep_time_minutes, instructions, tags)
VALUES
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM auth.users LIMIT 1),
    'Tortilla de Patatas',
    'La clásica tortilla española con cebolla caramelizada',
    4,
    35,
    '1. Pelar y cortar las patatas en rodajas finas.\n2. Freír las patatas en aceite de oliva a fuego medio hasta que estén tiernas.\n3. Batir los huevos en un bol grande.\n4. Mezclar las patatas escurridas con el huevo batido.\n5. Cuajar la tortilla en una sartén antiadherente, 3-4 minutos por cada lado.',
    '{española,clásica,fácil}'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM auth.users LIMIT 1),
    'Ensalada César',
    'Ensalada fresca con pollo, croutons y salsa césar',
    2,
    15,
    '1. Lavar y trocear la lechuga.\n2. Cocinar el pollo a la plancha y cortarlo en tiras.\n3. Preparar los croutons con pan tostado.\n4. Mezclar todos los ingredientes.\n5. Añadir la salsa césar y el parmesano.',
    '{ensalada,fresca,rápida}'
  );

-- Seed recipe ingredients
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, optional) VALUES
  -- Tortilla ingredients
  ((SELECT id FROM recipes WHERE name = 'Tortilla de Patatas'), 'Patatas', 500, 'g', false),
  ((SELECT id FROM recipes WHERE name = 'Tortilla de Patatas'), 'Huevos', 6, 'unit', false),
  ((SELECT id FROM recipes WHERE name = 'Tortilla de Patatas'), 'Cebolla', 1, 'unit', true),
  ((SELECT id FROM recipes WHERE name = 'Tortilla de Patatas'), 'Aceite de oliva', 100, 'ml', false),
  ((SELECT id FROM recipes WHERE name = 'Tortilla de Patatas'), 'Sal', 1, 'tsp', false),
  -- Ensalada César ingredients
  ((SELECT id FROM recipes WHERE name = 'Ensalada César'), 'Lechuga romana', 1, 'unit', false),
  ((SELECT id FROM recipes WHERE name = 'Ensalada César'), 'Pechuga de pollo', 200, 'g', false),
  ((SELECT id FROM recipes WHERE name = 'Ensalada César'), 'Pan de molde', 2, 'slice', false),
  ((SELECT id FROM recipes WHERE name = 'Ensalada César'), 'Queso parmesano', 50, 'g', false),
  ((SELECT id FROM recipes WHERE name = 'Ensalada César'), 'Salsa césar', 3, 'tbsp', false);

-- Seed some example products (cached catalog simulation)
INSERT INTO supermarket_products (supermarket, name, brand, price, unit, quantity, category, section_id) VALUES
  ('mercadona', 'Patatas de bolsa', 'Hacendado', 1.20, 'kg', 2, 'Frutas y Verduras', (SELECT id FROM supermarket_sections WHERE supermarket = 'mercadona' AND name = 'Frutas y Verduras')),
  ('mercadona', 'Huevos camperos XL', 'Hacendado', 3.45, 'unit', 6, 'Huevos', (SELECT id FROM supermarket_sections WHERE supermarket = 'mercadona' AND name = 'Huevos y Lácteos')),
  ('mercadona', 'Aceite de oliva virgen extra', 'Hacendado', 8.50, 'l', 1, 'Aceites', (SELECT id FROM supermarket_sections WHERE supermarket = 'mercadona' AND name = 'Despensa')),
  ('mercadona', 'Sal fina', 'Hacendado', 0.65, 'g', 1000, 'Condimentos', (SELECT id FROM supermarket_sections WHERE supermarket = 'mercadona' AND name = 'Despensa')),
  ('mercadona', 'Lechuga romana', 'Hacendado', 1.10, 'unit', 1, 'Verduras', (SELECT id FROM supermarket_sections WHERE supermarket = 'mercadona' AND name = 'Frutas y Verduras')),
  ('mercadona', 'Pechuga de pollo', 'Hacendado', 6.95, 'kg', 1, 'Carnes', (SELECT id FROM supermarket_sections WHERE supermarket = 'mercadona' AND name = 'Carnes y Pescados')),
  ('mercadona', 'Pan de molde integral', 'Hacendado', 2.30, 'unit', 1, 'Pan', (SELECT id FROM supermarket_sections WHERE supermarket = 'mercadona' AND name = 'Panadería')),
  ('mercadona', 'Queso parmesano rallado', 'Hacendado', 2.95, 'g', 150, 'Quesos', (SELECT id FROM supermarket_sections WHERE supermarket = 'mercadona' AND name = 'Huevos y Lácteos'));
