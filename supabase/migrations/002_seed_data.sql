-- АЛТЕХ Store — Seed Data
-- Brands, Categories, Sample Products

-- ============================================
-- BRANDS
-- ============================================
INSERT INTO brands (slug, name, sort_order) VALUES
  ('rolf', 'ROLF', 1),
  ('sintec', 'SINTEC', 2),
  ('takayama', 'TAKAYAMA', 3),
  ('kixx', 'KIXX', 4),
  ('rhinoil', 'RhinOIL', 5),
  ('himavto', 'ХИМАВТО', 6),
  ('volga', 'Volga Oil', 7);

-- ============================================
-- CATEGORIES — Lubricants
-- ============================================
INSERT INTO categories (slug, name, section, sort_order) VALUES
  ('motornye', 'Моторные', 'lubricants', 1),
  ('transmissionnye', 'Трансмиссионные', 'lubricants', 2),
  ('gidravlicheskie', 'Гидравлические', 'lubricants', 3),
  ('ohlazhdayushchie', 'Охлаждающие жидкости', 'lubricants', 4),
  ('smazki', 'Смазки', 'lubricants', 5),
  ('tormoznaya-zhidkost', 'Тормозная жидкость', 'lubricants', 6);

-- CATEGORIES — Filters
INSERT INTO categories (slug, name, section, sort_order) VALUES
  ('maslyanyy', 'Масляный', 'filters', 1),
  ('vozdushnyy', 'Воздушный', 'filters', 2),
  ('toplivnyy', 'Топливный', 'filters', 3),
  ('salonnyy', 'Салонный', 'filters', 4);

-- ============================================
-- PRODUCTS — ROLF Motor Oils
-- ============================================
INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec, acea_spec, approvals, is_featured)
SELECT
  'rolf-krafton-p5u-10w40',
  'ROLF Krafton P5 U 10W-40',
  b.id, c.id, 'lubricants',
  '10W-40', 'semi_synthetic',
  'API CI-4/SL, CH-4',
  'ACEA E7',
  'MB-Approval',
  true
FROM brands b, categories c WHERE b.slug = 'rolf' AND c.slug = 'motornye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec, acea_spec, approvals, is_featured)
SELECT
  'rolf-krafton-p5g-10w40',
  'ROLF Krafton P5 G 10W-40',
  b.id, c.id, 'lubricants',
  '10W-40', 'semi_synthetic',
  'API CK-4/CJ-4',
  'ACEA E9/E6/E7',
  'JASO DH-2',
  true
FROM brands b, categories c WHERE b.slug = 'rolf' AND c.slug = 'motornye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec, approvals)
SELECT
  'rolf-krafton-p5ue-10w30',
  'ROLF Krafton P5 UE 10W-30',
  b.id, c.id, 'lubricants',
  '10W-30', 'semi_synthetic',
  'API CK-4/CJ-4, ACEA E4, E7',
  'MB-Approval'
FROM brands b, categories c WHERE b.slug = 'rolf' AND c.slug = 'motornye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec)
SELECT
  'rolf-krafton-m5u-15w40',
  'ROLF Krafton M5 U 15W-40',
  b.id, c.id, 'lubricants',
  '15W-40', 'mineral',
  'API CI-4/SL'
FROM brands b, categories c WHERE b.slug = 'rolf' AND c.slug = 'motornye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec)
SELECT
  'rolf-krafton-s9m-5w30',
  'ROLF Krafton S9 M 5W-30',
  b.id, c.id, 'lubricants',
  '5W-30', 'synthetic',
  'API SP'
FROM brands b, categories c WHERE b.slug = 'rolf' AND c.slug = 'motornye';

-- ROLF Transmission
INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec)
SELECT
  'rolf-atf-iii',
  'ROLF ATF III',
  b.id, c.id, 'lubricants',
  'ATF III', 'synthetic',
  'Dexron III'
FROM brands b, categories c WHERE b.slug = 'rolf' AND c.slug = 'transmissionnye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, api_spec)
SELECT
  'rolf-transmission-s7-ae-75w90',
  'ROLF Transmission S7 AE 75W-90',
  b.id, c.id, 'lubricants',
  '75W-90',
  'API GL-4/GL-5'
FROM brands b, categories c WHERE b.slug = 'rolf' AND c.slug = 'transmissionnye';

-- ROLF Hydraulic
INSERT INTO products (slug, name, brand_id, category_id, section, viscosity)
SELECT
  'rolf-hydraulic-hvlp-32',
  'ROLF Hydraulic HVLP 32',
  b.id, c.id, 'lubricants',
  'HVLP 32'
FROM brands b, categories c WHERE b.slug = 'rolf' AND c.slug = 'gidravlicheskie';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity)
SELECT
  'rolf-hydraulic-hvlp-46',
  'ROLF Hydraulic HVLP 46',
  b.id, c.id, 'lubricants',
  'HVLP 46'
FROM brands b, categories c WHERE b.slug = 'rolf' AND c.slug = 'gidravlicheskie';

-- ROLF Coolant
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'rolf-coolant-g12',
  'ROLF G12 Антифриз',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'rolf' AND c.slug = 'ohlazhdayushchie';

-- ============================================
-- PRODUCTS — ХИМАВТО
-- ============================================
INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec)
SELECT
  'himavto-motor-10w40',
  'ХИМАВТО 10W-40',
  b.id, c.id, 'lubricants',
  '10W-40', 'semi_synthetic',
  'API SL/CF'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'motornye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec)
SELECT
  'himavto-motor-10w40-ci4',
  'ХИМАВТО 10W-40 CI-4',
  b.id, c.id, 'lubricants',
  '10W-40', 'semi_synthetic',
  'API CI-4'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'motornye';

-- ХИМАВТО Transmission
INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, api_spec)
SELECT
  'himavto-trans-75w90',
  'ХИМАВТО 75W-90',
  b.id, c.id, 'lubricants',
  '75W-90',
  'API GL-5'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'transmissionnye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, api_spec)
SELECT
  'himavto-trans-80w90-gl5',
  'ХИМАВТО 80W-90 GL-5',
  b.id, c.id, 'lubricants',
  '80W-90',
  'API GL-5'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'transmissionnye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, api_spec)
SELECT
  'himavto-trans-75w90-gl5',
  'ХИМАВТО 75W-90 GL-5',
  b.id, c.id, 'lubricants',
  '75W-90',
  'API GL-5'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'transmissionnye';

-- ХИМАВТО Hydraulic
INSERT INTO products (slug, name, brand_id, category_id, section, viscosity)
SELECT
  'himavto-hvlp-32',
  'ХИМАВТО HVLP-32',
  b.id, c.id, 'lubricants',
  'HVLP 32'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'gidravlicheskie';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity)
SELECT
  'himavto-hvlp-46',
  'ХИМАВТО HVLP-46',
  b.id, c.id, 'lubricants',
  'HVLP 46'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'gidravlicheskie';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity)
SELECT
  'himavto-vmgz-45',
  'ХИМАВТО ВМГЗ-45',
  b.id, c.id, 'lubricants',
  'ВМГЗ-45'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'gidravlicheskie';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity)
SELECT
  'himavto-vmgz-60',
  'ХИМАВТО ВМГЗ-60',
  b.id, c.id, 'lubricants',
  'ВМГЗ-60'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'gidravlicheskie';

-- ХИМАВТО Coolant
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'himavto-g12-40-red',
  'ХИМАВТО G12 -40 RED Professional',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'ohlazhdayushchie';

INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'himavto-g12-65-red',
  'ХИМАВТО G12 -65 RED Professional',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'ohlazhdayushchie';

-- ХИМАВТО Brake Fluid
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'himavto-dot4-plus',
  'ХИМАВТО DOT-4 Plus',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'tormoznaya-zhidkost';

-- ============================================
-- PRODUCTS — KIXX
-- ============================================
INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, api_spec)
SELECT
  'kixx-geartec-80w90-gl4',
  'KIXX Geartec 80W-90 GL-4',
  b.id, c.id, 'lubricants',
  '80W-90',
  'API GL-4'
FROM brands b, categories c WHERE b.slug = 'kixx' AND c.slug = 'transmissionnye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, api_spec)
SELECT
  'kixx-geartec-80w90-gl5',
  'KIXX Geartec 80W-90 GL-5',
  b.id, c.id, 'lubricants',
  '80W-90',
  'API GL-5'
FROM brands b, categories c WHERE b.slug = 'kixx' AND c.slug = 'transmissionnye';

-- KIXX Greases
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'kixx-grease-ep2',
  'KIXX Grease EP2',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'kixx' AND c.slug = 'smazki';

INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'kixx-grease-wr2',
  'KIXX Grease WR 2',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'kixx' AND c.slug = 'smazki';

INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'kixx-grease-wrm2',
  'KIXX Grease WR M2',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'kixx' AND c.slug = 'smazki';

-- ============================================
-- PRODUCTS — RhinOIL
-- ============================================
INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec)
SELECT
  'rhinoil-motor-15w40-ci4',
  'RhinOIL 15W-40 CI-4',
  b.id, c.id, 'lubricants',
  '15W-40', 'mineral',
  'API CI-4'
FROM brands b, categories c WHERE b.slug = 'rhinoil' AND c.slug = 'motornye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, api_spec)
SELECT
  'rhinoil-trans-75w90-gl4gl5',
  'RhinOIL 75W-90 GL-4/GL-5',
  b.id, c.id, 'lubricants',
  '75W-90',
  'API GL-4/GL-5'
FROM brands b, categories c WHERE b.slug = 'rhinoil' AND c.slug = 'transmissionnye';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity)
SELECT
  'rhinoil-hvlp-32',
  'RhinOIL HVLP-32',
  b.id, c.id, 'lubricants',
  'HVLP 32'
FROM brands b, categories c WHERE b.slug = 'rhinoil' AND c.slug = 'gidravlicheskie';

INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'rhinoil-clp68',
  'RhinOIL CLP 68 Редукторное',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'rhinoil' AND c.slug = 'gidravlicheskie';

INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'rhinoil-g12-65-red',
  'RhinOIL G12 -65 RED',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'rhinoil' AND c.slug = 'ohlazhdayushchie';

INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'rhinoil-g11-green-40',
  'RhinOIL G11 GREEN -40',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'rhinoil' AND c.slug = 'ohlazhdayushchie';

INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'rhinoil-g11-red-40',
  'RhinOIL G11 RED -40',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'rhinoil' AND c.slug = 'ohlazhdayushchie';

-- ============================================
-- PRODUCTS — Sintec
-- ============================================
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'sintec-coolant-g12',
  'SINTEC G12 Антифриз',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'sintec' AND c.slug = 'ohlazhdayushchie';

INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec)
SELECT
  'sintec-truck-10w40',
  'SINTEC Truck 10W-40',
  b.id, c.id, 'lubricants',
  '10W-40', 'semi_synthetic',
  'API CI-4'
FROM brands b, categories c WHERE b.slug = 'sintec' AND c.slug = 'motornye';

-- ============================================
-- PRODUCTS — Volga Oil
-- ============================================
INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type)
SELECT
  'volga-m10dm',
  'Volga Oil М10ДМ',
  b.id, c.id, 'lubricants',
  'М10ДМ', 'mineral'
FROM brands b, categories c WHERE b.slug = 'volga' AND c.slug = 'motornye';

INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'volga-ep2',
  'Volga Oil EP-2',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'volga' AND c.slug = 'smazki';

INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT
  'volga-litol-24',
  'Volga Oil Литол-24',
  b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'volga' AND c.slug = 'smazki';

-- ============================================
-- PRODUCT VARIANTS (prices are approximate)
-- ============================================

-- ROLF Krafton P5 U 10W-40 variants
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '200 л', 200, 80000, 400, 1
FROM products p WHERE p.slug = 'rolf-krafton-p5u-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 8800, 440, 2
FROM products p WHERE p.slug = 'rolf-krafton-p5u-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 420, 420, 'литр', 3
FROM products p WHERE p.slug = 'rolf-krafton-p5u-10w40';

-- ROLF Krafton P5 G 10W-40 variants
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '200 л', 200, 82000, 410, 1
FROM products p WHERE p.slug = 'rolf-krafton-p5g-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 9000, 450, 2
FROM products p WHERE p.slug = 'rolf-krafton-p5g-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 430, 430, 'литр', 3
FROM products p WHERE p.slug = 'rolf-krafton-p5g-10w40';

-- ROLF Krafton S9 M 5W-30
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 12000, 600, 1
FROM products p WHERE p.slug = 'rolf-krafton-s9m-5w30';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '4 л', 4, 2800, 700, 2
FROM products p WHERE p.slug = 'rolf-krafton-s9m-5w30';

-- ХИМАВТО Motor 10W-40
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '200 л', 200, 56000, 280, 1
FROM products p WHERE p.slug = 'himavto-motor-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 6200, 310, 2
FROM products p WHERE p.slug = 'himavto-motor-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 300, 300, 'литр', 3
FROM products p WHERE p.slug = 'himavto-motor-10w40';

-- Vehicle Brands seed
INSERT INTO vehicle_brands (slug, name, sort_order) VALUES
  ('shacman', 'SHACMAN', 1),
  ('howo', 'HOWO', 2),
  ('faw', 'FAW', 3),
  ('sitrak', 'SITRAK', 4),
  ('hino', 'HINO', 5),
  ('shanbo', 'SHANBO', 6);
