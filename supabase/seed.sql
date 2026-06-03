-- =============================================================================
-- CESTA INTELIGENTE — Seed Data
-- =============================================================================
-- Datos iniciales para desarrollo y demostración.
-- Ejecutar después de aplicar la migración 00002_full_schema.sql.
--
-- Nota: Este seed incluye recetas base y las asigna al primer usuario existente
-- en auth.users para entornos de desarrollo/demo.

-- 1. Supermarket: Mercadona ---------------------------------------------------
insert into supermarkets (id, name, display_name, color, website) values
  (
    'a0000000-0000-0000-0000-000000000001',
    'mercadona',
    'Mercadona',
    '#0077b3',
    'https://www.mercadona.es'
  )
on conflict (name) do nothing;

-- 2. Product Categories (secciones de Mercadona) ------------------------------
insert into product_categories (id, supermarket_id, name, display_order) values
  ('b1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Frutas y Verduras',     1),
  ('b1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Carnicería',            2),
  ('b1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Pescadería',            3),
  ('b1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Huevos y Lácteos',      4),
  ('b1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Panadería',             5),
  ('b1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Despensa',              6),
  ('b1000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Bebidas',               7),
  ('b1000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Congelados',            8),
  ('b1000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Limpieza',              9),
  ('b1000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Higiene Personal',     10)
on conflict (supermarket_id, name) do nothing;

-- 3. Ingredients (catálogo maestro) -------------------------------------------
insert into ingredients (id, name, category) values
  ('c0000000-0000-0000-0000-000000000001', 'Tomate',              'Frutas y Verduras'),
  ('c0000000-0000-0000-0000-000000000002', 'Cebolla',             'Frutas y Verduras'),
  ('c0000000-0000-0000-0000-000000000003', 'Ajo',                 'Frutas y Verduras'),
  ('c0000000-0000-0000-0000-000000000004', 'Pimiento Verde',      'Frutas y Verduras'),
  ('c0000000-0000-0000-0000-000000000005', 'Pollo',               'Carnicería'),
  ('c0000000-0000-0000-0000-000000000006', 'Huevo',               'Huevos y Lácteos'),
  ('c0000000-0000-0000-0000-000000000007', 'Leche',               'Huevos y Lácteos'),
  ('c0000000-0000-0000-0000-000000000008', 'Pan',                 'Panadería'),
  ('c0000000-0000-0000-0000-000000000009', 'Arroz',               'Despensa'),
  ('c0000000-0000-0000-0000-000000000010', 'Aceite de Oliva',     'Despensa'),
  ('c0000000-0000-0000-0000-000000000011', 'Patata',              'Frutas y Verduras')
on conflict (name) do nothing;

-- 4. Mercadona Products (ejemplos) --------------------------------------------
insert into supermarket_products (id, supermarket_id, name, price, unit, quantity, category_id) values
  -- Frutas y Verduras
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Tomate Pera bandeja 500g',   1.89, 'g', 500,  'b1000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Cebolla bolsa 1kg',          1.49, 'g', 1000, 'b1000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Ajo cabeza',                 0.89, 'ud', 1,    'b1000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Pimiento verde bolsa 500g', 1.29, 'g', 500,  'b1000000-0000-0000-0000-000000000001'),
  -- Carnicería
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Pollo entero',               4.50, 'g', 1000, 'b1000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Pechuga de pollo bandeja',   5.99, 'g', 600,  'b1000000-0000-0000-0000-000000000002'),
  -- Huevos y Lácteos
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Huevos camperos 6 uds',     2.29, 'ud', 6,    'b1000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Leche semidesnatada 1L',    0.95, 'l',  1,    'b1000000-0000-0000-0000-000000000004'),
  -- Panadería
  ('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Pan de barra',               0.55, 'ud', 1,    'b1000000-0000-0000-0000-000000000005'),
  -- Despensa
  ('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Arroz SOS redondo 1kg',     1.85, 'g', 1000, 'b1000000-0000-0000-0000-000000000006'),
  ('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Aceite de Oliva Virgen Extra 1L', 4.20, 'l', 1, 'b1000000-0000-0000-0000-000000000006')
on conflict do nothing;

-- 5. Product-Ingredient Matches -----------------------------------------------
insert into product_ingredient_matches (product_id, ingredient_id, match_type) values
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'exact'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'exact'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'exact'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'exact'),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'synonym'),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000005', 'exact'),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000006', 'exact'),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000007', 'exact'),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000008', 'synonym'),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000009', 'exact'),
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000010', 'exact')
on conflict (product_id, ingredient_id) do nothing;

-- 6. Recetas realistas para familias (>= 30) ----------------------------------
insert into ingredients (name, category) values
  ('Pechuga de pollo', 'Carnicería'),
  ('Muslo de pollo', 'Carnicería'),
  ('Pavo', 'Carnicería'),
  ('Carne picada', 'Carnicería'),
  ('Atún en lata', 'Despensa'),
  ('Salmón', 'Pescadería'),
  ('Merluza', 'Pescadería'),
  ('Gambas', 'Pescadería'),
  ('Garbanzos cocidos', 'Despensa'),
  ('Lentejas cocidas', 'Despensa'),
  ('Lentejas rojas', 'Despensa'),
  ('Alubias cocidas', 'Despensa'),
  ('Arroz integral', 'Despensa'),
  ('Pasta integral', 'Despensa'),
  ('Macarrones', 'Despensa'),
  ('Quinoa', 'Despensa'),
  ('Avena', 'Despensa'),
  ('Tortilla de trigo', 'Despensa'),
  ('Pan de molde', 'Panadería'),
  ('Pan de barra', 'Panadería'),
  ('Tomate triturado', 'Despensa'),
  ('Calabacín', 'Frutas y Verduras'),
  ('Berenjena', 'Frutas y Verduras'),
  ('Zanahoria', 'Frutas y Verduras'),
  ('Pimiento rojo', 'Frutas y Verduras'),
  ('Brócoli', 'Frutas y Verduras'),
  ('Espinacas', 'Frutas y Verduras'),
  ('Lechuga', 'Frutas y Verduras'),
  ('Pepino', 'Frutas y Verduras'),
  ('Champiñones', 'Frutas y Verduras'),
  ('Calabaza', 'Frutas y Verduras'),
  ('Patata', 'Frutas y Verduras'),
  ('Yogur natural', 'Huevos y Lácteos'),
  ('Queso rallado', 'Huevos y Lácteos'),
  ('Leche semidesnatada', 'Huevos y Lácteos'),
  ('Harina', 'Despensa'),
  ('Pan rallado', 'Despensa'),
  ('Canela', 'Despensa'),
  ('Limón', 'Frutas y Verduras'),
  ('Plátano', 'Frutas y Verduras')
on conflict (name) do nothing;

do $$
declare
  v_user_id uuid;
  v_household_id uuid;
  r record;
  v_recipe_id uuid;
begin
  select id into v_user_id from auth.users order by created_at asc limit 1;
  if v_user_id is null then
    raise notice 'No users found in auth.users. Recipe seed skipped.';
    return;
  end if;

  select household_id into v_household_id
  from household_members
  where user_id = v_user_id
  order by created_at asc
  limit 1;

  update households
  set primary_supermarket_id = 'a0000000-0000-0000-0000-000000000001'
  where id = v_household_id
    and primary_supermarket_id is null;

  create temp table tmp_recipe_seed (
    key text,
    name text,
    description text,
    base_servings int,
    prep_time int,
    cook_time int,
    difficulty text,
    category text,
    tags text[],
    instructions text
  ) on commit drop;

  insert into tmp_recipe_seed values
  ('r01','Ensalada de garbanzos mediterranea','Ensalada fresca y saciante para diario.',4,10,0,'easy','Ensaladas',array['healthy','vegana','economica'],'Mezclar garbanzos, tomate, pepino y cebolla. Aliñar con aceite, limon y sal.'),
  ('r02','Salmon al horno con brocoli','Plato saludable y muy facil.',4,10,20,'easy','Pescados',array['healthy','deportistas'],'Hornear salmon con brocoli, aceite, ajo y limon hasta dorar.'),
  ('r03','Crema de calabacin ligera','Crema suave para toda la familia.',4,10,20,'easy','Sopas y Cremas',array['healthy','perdida_peso'],'Cocer calabacin, patata y cebolla. Triturar con sal y aceite.'),
  ('r04','Pollo a la plancha con arroz','Basico alto en proteina.',4,10,20,'easy','Carnes',array['alta_proteina','deportistas'],'Cocinar arroz. Hacer pollo a la plancha con ajo y servir junto.'),
  ('r05','Tortilla de atun y espinacas','Cena proteica en 15 minutos.',2,5,10,'easy','Huevos',array['alta_proteina','cenas_rapidas'],'Batir huevos con atun y espinacas. Cuajar en sarten.'),
  ('r06','Pavo salteado con verduras','Salteado rapido rico en proteina.',4,10,12,'easy','Carnes',array['alta_proteina','healthy'],'Saltear pavo con pimiento, cebolla y calabacin.'),
  ('r07','Lentejas guisadas familiares','Guiso completo de cuchara.',6,15,35,'medium','Legumbres',array['familiares','economicas'],'Sofreir cebolla, ajo y zanahoria. Anadir lentejas, tomate y cocer.'),
  ('r08','Macarrones boloñesa casera','Clasico que gusta a todos.',5,15,25,'easy','Pastas',array['familiares','ninos'],'Cocer pasta. Preparar salsa con carne picada, cebolla y tomate.'),
  ('r09','Pollo al horno con patatas','Receta de domingo muy sencilla.',6,15,50,'easy','Carnes',array['familiares','de_la_abuela'],'Hornear muslos de pollo con patata, cebolla y aceite.'),
  ('r10','Arroz a la cubana rapido','Economico y muy resulton.',4,10,18,'easy','Arroces',array['economicas','ninos'],'Cocer arroz. Servir con tomate frito y huevo a la plancha.'),
  ('r11','Sopa de fideos con pollo','Receta barata y reconfortante.',4,10,20,'easy','Sopas y Cremas',array['economicas','de_la_abuela'],'Hervir caldo con pollo desmigado y anadir fideos.'),
  ('r12','Tortilla de patatas clasica','Basico economico y familiar.',4,15,25,'medium','Huevos',array['economicas','de_la_abuela'],'Pochar patata y cebolla. Mezclar con huevo y cuajar.'),
  ('r13','Cocido rapido de garbanzos','Version agil del cocido.',6,20,40,'medium','Legumbres',array['de_la_abuela','familiares'],'Guisar garbanzos con patata, zanahoria, pollo y verduras.'),
  ('r14','Albondigas en salsa de tomate','Receta tradicional casera.',5,20,30,'medium','Carnes',array['de_la_abuela','familiares'],'Formar albondigas con carne y pan rallado. Cocer en salsa de tomate.'),
  ('r15','Arroz con leche casero','Postre tradicional sencillo.',6,5,35,'easy','Postres',array['de_la_abuela','ninos'],'Cocer arroz con leche y canela hasta cremoso.'),
  ('r16','Curry de garbanzos y calabaza','Vegano facil para diario.',4,12,25,'easy','Legumbres',array['vegana','batch_cooking'],'Sofreir cebolla y ajo. Añadir calabaza, garbanzos y tomate triturado.'),
  ('r17','Chili vegano de alubias','Plato completo y economico.',4,10,25,'easy','Legumbres',array['vegana','economicas'],'Guisar alubias con cebolla, pimiento, tomate y especias.'),
  ('r18','Pasta integral con verduras','Pasta vegana para entre semana.',4,10,15,'easy','Pastas',array['vegana','healthy'],'Cocer pasta y mezclar con salteado de calabacin, pimiento y cebolla.'),
  ('r19','Lasaña de verduras sencilla','Vegetariana apta para toda la casa.',6,20,35,'medium','Pastas',array['vegetariana','familiares'],'Montar capas de pasta, verduras salteadas, tomate y queso. Hornear.'),
  ('r20','Revuelto de champiñones','Cena vegetariana rapida.',2,5,10,'easy','Huevos',array['vegetariana','cenas_rapidas'],'Saltear champiñones y cuajar con huevo.'),
  ('r21','Crema de lentejas rojas','Alta en fibra y vegetariana.',4,10,20,'easy','Sopas y Cremas',array['vegetariana','healthy'],'Cocer lentejas rojas con zanahoria, cebolla y triturar.'),
  ('r22','Bowl de quinoa y pollo','Perfecto para comer tras entrenar.',4,15,20,'easy','Arroces',array['deportistas','alta_proteina'],'Cocer quinoa y servir con pollo, brocoli y aceite de oliva.'),
  ('r23','Avena overnight con plátano','Desayuno deportivo rapido.',2,5,0,'easy','Desayunos',array['deportistas','healthy'],'Mezclar avena con leche y yogur. Reposar en frio y añadir platano.'),
  ('r24','Merluza con patata cocida','Plato limpio y facil de digerir.',4,10,18,'easy','Pescados',array['deportistas','perdida_peso'],'Cocer patata. Hacer merluza a la plancha con limon.'),
  ('r25','Merluza al papillote','Cena ligera para perder peso.',4,10,20,'easy','Pescados',array['perdida_peso','healthy'],'Hornear merluza con cebolla, calabacin y limon en papel.'),
  ('r26','Ensalada de pollo y yogur','Ligera y saciante.',3,10,10,'easy','Ensaladas',array['perdida_peso','alta_proteina'],'Mezclar pollo cocinado con lechuga, pepino y salsa de yogur.'),
  ('r27','Nuggets de pollo caseros','Version casera para peques.',4,15,18,'easy','Carnes',array['ninos','familiares'],'Empanar pollo con huevo y pan rallado. Hornear hasta crujir.'),
  ('r28','Pure de patata y zanahoria','Acompañamiento suave para niños.',4,10,20,'easy','Verduras',array['ninos','economicas'],'Cocer patata y zanahoria y triturar con un poco de leche.'),
  ('r29','Mini pizzas de pan de molde','Cena express para niños.',4,10,10,'easy','Cenas',array['ninos','cenas_rapidas'],'Cubrir pan de molde con tomate, queso y toppings. Gratinar.'),
  ('r30','Quesadillas de pollo y queso','Cena rapida de diario.',3,8,8,'easy','Cenas',array['cenas_rapidas','familiares'],'Rellenar tortillas con pollo y queso, dorar en sarten y cortar.'),
  ('r31','Tortilla francesa con espinacas','Muy rapida y proteica.',2,5,6,'easy','Huevos',array['cenas_rapidas','alta_proteina'],'Batir huevos con espinacas y cuajar.'),
  ('r32','Salteado de gambas al ajo','Plato rapido para la noche.',3,7,8,'easy','Pescados',array['cenas_rapidas','healthy'],'Saltear gambas con ajo y aceite. Servir con ensalada.'),
  ('r33','Pollo desmechado para la semana','Base para varias comidas.',6,10,35,'easy','Carnes',array['batch_cooking','alta_proteina'],'Cocer pollo con cebolla y ajo. Desmenuzar y guardar.'),
  ('r34','Arroz integral base semanal','Guarnicion para varios platos.',8,5,30,'easy','Arroces',array['batch_cooking','healthy'],'Cocer arroz integral y guardar en raciones.'),
  ('r35','Verduras asadas de bandeja','Base vegetal para toda la semana.',6,10,30,'easy','Verduras',array['batch_cooking','vegana'],'Hornear calabacin, pimiento, cebolla y zanahoria con aceite.'),
  ('r36','Garbanzos salteados con espinacas','Rapido, economico y completo.',4,10,12,'easy','Legumbres',array['healthy','economicas','vegana'],'Saltear ajo y cebolla, añadir garbanzos y espinacas y cocinar 5 minutos.');

  create temp table tmp_recipe_ingredients (
    recipe_key text,
    ingredient_name text,
    qty numeric,
    unit text
  ) on commit drop;

  insert into tmp_recipe_ingredients values
  ('r01','Garbanzos cocidos',500,'g'),('r01','Tomate',2,'ud'),('r01','Pepino',1,'ud'),('r01','Cebolla',0.5,'ud'),('r01','Aceite de Oliva',30,'ml'),('r01','Limón',1,'ud'),
  ('r02','Salmón',600,'g'),('r02','Brócoli',400,'g'),('r02','Ajo',2,'ud'),('r02','Aceite de Oliva',20,'ml'),('r02','Limón',1,'ud'),
  ('r03','Calabacín',800,'g'),('r03','Patata',250,'g'),('r03','Cebolla',1,'ud'),('r03','Aceite de Oliva',20,'ml'),
  ('r04','Pechuga de pollo',700,'g'),('r04','Arroz',320,'g'),('r04','Ajo',2,'ud'),('r04','Aceite de Oliva',20,'ml'),
  ('r05','Huevo',4,'ud'),('r05','Atún en lata',160,'g'),('r05','Espinacas',150,'g'),('r05','Aceite de Oliva',10,'ml'),
  ('r06','Pavo',700,'g'),('r06','Pimiento rojo',1,'ud'),('r06','Cebolla',1,'ud'),('r06','Calabacín',1,'ud'),('r06','Aceite de Oliva',20,'ml'),
  ('r07','Lentejas cocidas',800,'g'),('r07','Cebolla',1,'ud'),('r07','Zanahoria',2,'ud'),('r07','Tomate triturado',300,'g'),('r07','Aceite de Oliva',20,'ml'),
  ('r08','Macarrones',450,'g'),('r08','Carne picada',500,'g'),('r08','Cebolla',1,'ud'),('r08','Tomate triturado',400,'g'),('r08','Aceite de Oliva',20,'ml'),
  ('r09','Muslo de pollo',1200,'g'),('r09','Patata',800,'g'),('r09','Cebolla',1,'ud'),('r09','Ajo',3,'ud'),('r09','Aceite de Oliva',30,'ml'),
  ('r10','Arroz',320,'g'),('r10','Huevo',4,'ud'),('r10','Tomate triturado',250,'g'),('r10','Aceite de Oliva',20,'ml'),
  ('r11','Pechuga de pollo',400,'g'),('r11','Zanahoria',2,'ud'),('r11','Cebolla',1,'ud'),('r11','Pasta integral',200,'g'),('r11','Aceite de Oliva',15,'ml'),
  ('r12','Patata',900,'g'),('r12','Cebolla',1,'ud'),('r12','Huevo',6,'ud'),('r12','Aceite de Oliva',80,'ml'),
  ('r13','Garbanzos cocidos',900,'g'),('r13','Pechuga de pollo',500,'g'),('r13','Patata',400,'g'),('r13','Zanahoria',2,'ud'),('r13','Cebolla',1,'ud'),
  ('r14','Carne picada',700,'g'),('r14','Pan rallado',50,'g'),('r14','Huevo',1,'ud'),('r14','Tomate triturado',500,'g'),('r14','Cebolla',1,'ud'),
  ('r15','Arroz',180,'g'),('r15','Leche semidesnatada',1500,'ml'),('r15','Canela',2,'ud'),('r15','Limón',1,'ud'),
  ('r16','Garbanzos cocidos',700,'g'),('r16','Calabaza',500,'g'),('r16','Cebolla',1,'ud'),('r16','Ajo',2,'ud'),('r16','Tomate triturado',300,'g'),
  ('r17','Alubias cocidas',700,'g'),('r17','Cebolla',1,'ud'),('r17','Pimiento rojo',1,'ud'),('r17','Tomate triturado',300,'g'),('r17','Ajo',2,'ud'),
  ('r18','Pasta integral',350,'g'),('r18','Calabacín',1,'ud'),('r18','Pimiento rojo',1,'ud'),('r18','Cebolla',1,'ud'),('r18','Aceite de Oliva',20,'ml'),
  ('r19','Berenjena',1,'ud'),('r19','Calabacín',1,'ud'),('r19','Tomate triturado',400,'g'),('r19','Queso rallado',150,'g'),('r19','Cebolla',1,'ud'),
  ('r20','Huevo',4,'ud'),('r20','Champiñones',300,'g'),('r20','Ajo',1,'ud'),('r20','Aceite de Oliva',15,'ml'),
  ('r21','Lentejas rojas',300,'g'),('r21','Zanahoria',2,'ud'),('r21','Cebolla',1,'ud'),('r21','Aceite de Oliva',20,'ml'),
  ('r22','Quinoa',300,'g'),('r22','Pechuga de pollo',600,'g'),('r22','Brócoli',300,'g'),('r22','Aceite de Oliva',20,'ml'),
  ('r23','Avena',120,'g'),('r23','Leche semidesnatada',300,'ml'),('r23','Yogur natural',250,'g'),('r23','Plátano',2,'ud'),
  ('r24','Merluza',700,'g'),('r24','Patata',700,'g'),('r24','Limón',1,'ud'),('r24','Aceite de Oliva',15,'ml'),
  ('r25','Merluza',700,'g'),('r25','Cebolla',1,'ud'),('r25','Calabacín',1,'ud'),('r25','Limón',1,'ud'),('r25','Aceite de Oliva',15,'ml'),
  ('r26','Pechuga de pollo',500,'g'),('r26','Lechuga',1,'ud'),('r26','Pepino',1,'ud'),('r26','Yogur natural',200,'g'),('r26','Limón',1,'ud'),
  ('r27','Pechuga de pollo',700,'g'),('r27','Huevo',2,'ud'),('r27','Pan rallado',120,'g'),('r27','Aceite de Oliva',20,'ml'),
  ('r28','Patata',700,'g'),('r28','Zanahoria',3,'ud'),('r28','Leche semidesnatada',150,'ml'),('r28','Aceite de Oliva',10,'ml'),
  ('r29','Pan de molde',8,'ud'),('r29','Tomate triturado',200,'g'),('r29','Queso rallado',200,'g'),('r29','Atún en lata',120,'g'),
  ('r30','Tortilla de trigo',6,'ud'),('r30','Pechuga de pollo',400,'g'),('r30','Queso rallado',180,'g'),('r30','Cebolla',0.5,'ud'),
  ('r31','Huevo',4,'ud'),('r31','Espinacas',120,'g'),('r31','Aceite de Oliva',10,'ml'),
  ('r32','Gambas',500,'g'),('r32','Ajo',3,'ud'),('r32','Aceite de Oliva',20,'ml'),('r32','Lechuga',1,'ud'),
  ('r33','Pechuga de pollo',1200,'g'),('r33','Cebolla',1,'ud'),('r33','Ajo',3,'ud'),('r33','Aceite de Oliva',20,'ml'),
  ('r34','Arroz integral',600,'g'),('r34','Aceite de Oliva',10,'ml'),
  ('r35','Calabacín',2,'ud'),('r35','Pimiento rojo',2,'ud'),('r35','Cebolla',2,'ud'),('r35','Zanahoria',3,'ud'),('r35','Aceite de Oliva',30,'ml'),
  ('r36','Garbanzos cocidos',700,'g'),('r36','Espinacas',250,'g'),('r36','Cebolla',1,'ud'),('r36','Ajo',2,'ud'),('r36','Aceite de Oliva',15,'ml');

  for r in select * from tmp_recipe_seed loop
    insert into recipes (
      household_id, created_by, name, description,
      base_servings, prep_time_minutes, cook_time_minutes,
      difficulty, category, instructions, tags, is_public
    )
    values (
      v_household_id, v_user_id, r.name, r.description,
      r.base_servings, r.prep_time, r.cook_time,
      r.difficulty, r.category, r.instructions, r.tags, true
    )
    on conflict do nothing
    returning id into v_recipe_id;

    if v_recipe_id is null then
      select id into v_recipe_id from recipes where created_by = v_user_id and name = r.name limit 1;
    end if;

    insert into recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
    select v_recipe_id, i.id, tri.qty, tri.unit
    from tmp_recipe_ingredients tri
    join ingredients i on i.name = tri.ingredient_name
    where tri.recipe_key = r.key;
  end loop;

  -- Assign food images to recipes
  update public.recipes set image_url = 'https://foodish-api.com/images/burger/burger33.jpg' where name = 'Salmon al horno con brocoli';
  update public.recipes set image_url = 'https://foodish-api.com/images/idly/idly28.jpg' where name = 'Crema de calabacin ligera';
  update public.recipes set image_url = 'https://foodish-api.com/images/dosa/dosa70.jpg' where name = 'Pollo a la plancha con arroz';
  update public.recipes set image_url = 'https://foodish-api.com/images/burger/burger71.jpg' where name = 'Tortilla de atun y espinacas';
  update public.recipes set image_url = 'https://foodish-api.com/images/pasta/pasta27.jpg' where name = 'Pavo salteado con verduras';
  update public.recipes set image_url = 'https://foodish-api.com/images/biryani/biryani50.jpg' where name = 'Lentejas guisadas familiares';
  update public.recipes set image_url = 'https://foodish-api.com/images/rice/rice34.jpg' where name = 'Macarrones boloñesa casera';
  update public.recipes set image_url = 'https://foodish-api.com/images/dosa/dosa74.jpg' where name = 'Pollo al horno con patatas';
  update public.recipes set image_url = 'https://foodish-api.com/images/butter-chicken/butter-chicken22.jpg' where name = 'Arroz a la cubana rapido';
  update public.recipes set image_url = 'https://foodish-api.com/images/rice/rice25.jpg' where name = 'Sopa de fideos con pollo';
  update public.recipes set image_url = 'https://foodish-api.com/images/samosa/samosa16.jpg' where name = 'Tortilla de patatas clasica';
  update public.recipes set image_url = 'https://foodish-api.com/images/burger/burger12.jpg' where name = 'Cocido rapido de garbanzos';
  update public.recipes set image_url = 'https://foodish-api.com/images/burger/burger69.jpg' where name = 'Albondigas en salsa de tomate';
  update public.recipes set image_url = 'https://foodish-api.com/images/dessert/dessert11.jpg' where name = 'Arroz con leche casero';
  update public.recipes set image_url = 'https://foodish-api.com/images/dessert/dessert27.jpg' where name = 'Curry de garbanzos y calabaza';
  update public.recipes set image_url = 'https://foodish-api.com/images/idly/idly52.jpg' where name = 'Chili vegano de alubias';
  update public.recipes set image_url = 'https://foodish-api.com/images/pasta/pasta7.jpg' where name = 'Pasta integral con verduras';
  update public.recipes set image_url = 'https://foodish-api.com/images/pizza/pizza74.jpg' where name = 'Lasaña de verduras sencilla';
  update public.recipes set image_url = 'https://foodish-api.com/images/pizza/pizza81.jpg' where name = 'Revuelto de champiñones';
  update public.recipes set image_url = 'https://foodish-api.com/images/pasta/pasta13.jpg' where name = 'Bowl de quinoa y pollo';
  update public.recipes set image_url = 'https://foodish-api.com/images/burger/burger41.jpg' where name = 'Avena overnight con plátano';
  update public.recipes set image_url = 'https://foodish-api.com/images/rice/rice1.jpg' where name = 'Merluza con patata cocida';
  update public.recipes set image_url = 'https://foodish-api.com/images/dosa/dosa2.jpg' where name = 'Ensalada de garbanzos mediterranea';
  update public.recipes set image_url = 'https://foodish-api.com/images/pasta/pasta20.jpg' where name = 'Crema de lentejas rojas';
  update public.recipes set image_url = 'https://foodish-api.com/images/dosa/dosa60.jpg' where name = 'Merluza al papillote';
  update public.recipes set image_url = 'https://foodish-api.com/images/pizza/pizza28.jpg' where name = 'Ensalada de pollo y yogur';
  update public.recipes set image_url = 'https://foodish-api.com/images/pasta/pasta22.jpg' where name = 'Nuggets de pollo caseros';
  update public.recipes set image_url = 'https://foodish-api.com/images/pasta/pasta28.jpg' where name = 'Pure de patata y zanahoria';
  update public.recipes set image_url = 'https://foodish-api.com/images/dessert/dessert33.jpg' where name = 'Mini pizzas de pan de molde';
  update public.recipes set image_url = 'https://foodish-api.com/images/biryani/biryani12.jpg' where name = 'Quesadillas de pollo y queso';
  update public.recipes set image_url = 'https://foodish-api.com/images/burger/burger31.jpg' where name = 'Tortilla francesa con espinacas';
  update public.recipes set image_url = 'https://foodish-api.com/images/biryani/biryani78.jpg' where name = 'Salteado de gambas al ajo';
  update public.recipes set image_url = 'https://foodish-api.com/images/rice/rice29.jpg' where name = 'Pollo desmechado para la semana';
  update public.recipes set image_url = 'https://foodish-api.com/images/samosa/samosa10.jpg' where name = 'Arroz integral base semanal';
  update public.recipes set image_url = 'https://foodish-api.com/images/idly/idly18.jpg' where name = 'Verduras asadas de bandeja';
  update public.recipes set image_url = 'https://foodish-api.com/images/butter-chicken/butter-chicken7.jpg' where name = 'Garbanzos salteados con espinacas';
end $$;
