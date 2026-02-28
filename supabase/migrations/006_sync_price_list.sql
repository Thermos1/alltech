-- ============================================
-- Migration 006: Sync catalog with АЛТЕХ Price List (February 2026)
-- Source of truth: ПРАЙС АЛТЕХ ФЕВРАЛЬ 2026.pdf
-- ============================================

-- ============================================
-- 1. NEW BRANDS
-- ============================================
INSERT INTO brands (slug, name, sort_order) VALUES
  ('akross', 'AKross', 8),
  ('savtok', 'Savtok', 9),
  ('prochee', 'Прочее', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. NEW CATEGORIES
-- ============================================
INSERT INTO categories (slug, name, section, sort_order) VALUES
  ('industrialnye', 'Индустриальные масла', 'lubricants', 7),
  ('avtohimiya', 'Автохимия', 'lubricants', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. DEACTIVATE PRODUCTS NOT IN PRICE LIST
-- ============================================
UPDATE products SET is_active = false, updated_at = now() WHERE slug IN (
  'rolf-krafton-s9m-5w30',
  'himavto-trans-75w90',
  'himavto-trans-75w90-gl5',
  'rhinoil-motor-15w40-ci4',
  'rhinoil-trans-75w90-gl4gl5',
  'rhinoil-g12-65-red',
  'rhinoil-g11-green-40',
  'rhinoil-g11-red-40',
  'volga-m10dm',
  'himavto-g12-65-red',
  'kixx-geartec-80w90-gl5',
  'kixx-grease-ep2'
);

-- ============================================
-- 4. DEACTIVATE ALL EXISTING VARIANTS
-- (keep for order_items FK integrity, RLS hides them)
-- ============================================
UPDATE product_variants SET is_active = false, updated_at = now();

-- ============================================
-- 5. NEW PRODUCTS
-- ============================================

-- AKross PROFESSIONAL 15W-40
INSERT INTO products (slug, name, brand_id, category_id, section, viscosity, base_type, api_spec)
SELECT 'akross-15w40-ci4', 'AKross PROFESSIONAL 15W-40', b.id, c.id, 'lubricants',
  '15W-40', 'semi_synthetic', 'API CI-4/SL'
FROM brands b, categories c WHERE b.slug = 'akross' AND c.slug = 'motornye'
ON CONFLICT (slug) DO NOTHING;

-- KIXX Outboard 2-Cycle Oil
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT 'kixx-outboard-2cycle', 'KIXX Outboard 2-Cycle Oil', b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'kixx' AND c.slug = 'motornye'
ON CONFLICT (slug) DO NOTHING;

-- KIXX GS Grease Moly EP 2
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT 'kixx-grease-moly-ep2', 'KIXX GS Grease Moly EP 2', b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'kixx' AND c.slug = 'smazki'
ON CONFLICT (slug) DO NOTHING;

-- ХИМАВТО Масло «А» гидравлическое
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT 'himavto-maslo-a', 'ХИМАВТО Масло «А» гидравлическое', b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'himavto' AND c.slug = 'gidravlicheskie'
ON CONFLICT (slug) DO NOTHING;

-- RhinOIL VDL-32 S Компрессионное
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT 'rhinoil-vdl32s', 'RhinOIL VDL-32 S Компрессионное', b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'rhinoil' AND c.slug = 'industrialnye'
ON CONFLICT (slug) DO NOTHING;

-- Savtok Premium 40 Тосол
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT 'savtok-tosol-premium40', 'Savtok Premium 40 Тосол', b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'savtok' AND c.slug = 'ohlazhdayushchie'
ON CONFLICT (slug) DO NOTHING;

-- ГОСТ Тосол А-40 синий
INSERT INTO products (slug, name, brand_id, category_id, section, approvals)
SELECT 'gost-tosol-a40', 'Тосол А-40 синий', b.id, c.id, 'lubricants', 'ГОСТ 28084-89'
FROM brands b, categories c WHERE b.slug = 'prochee' AND c.slug = 'ohlazhdayushchie'
ON CONFLICT (slug) DO NOTHING;

-- Sintec Арктика -20 стеклоомыватель
INSERT INTO products (slug, name, brand_id, category_id, section)
SELECT 'sintec-arktika-20', 'Sintec Арктика -20 стеклоомыватель', b.id, c.id, 'lubricants'
FROM brands b, categories c WHERE b.slug = 'sintec' AND c.slug = 'avtohimiya'
ON CONFLICT (slug) DO NOTHING;

-- Move RhinOIL CLP 68 to industrialnye category
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'industrialnye'), updated_at = now()
WHERE slug = 'rhinoil-clp68';

-- ============================================
-- 6. UPDATE EXISTING PRODUCT SPECS (approvals from price list)
-- ============================================

UPDATE products SET
  api_spec = 'API CK-4/CJ-4',
  acea_spec = 'ACEA E9/E6/E7',
  approvals = 'JASO DH-2; CAT ECF-3; Cummins CES 20086; Cummins CES 20092; Detroit Diesel 93K222; Deutz DQC IV-18 LA; Mack EOS-4.5; MAN M3775; Volvo VDS-4.5; MB 228.51; MB 228.52; MTU oil category 2.1; MTU oil category 3.1; Renault RVI RLD-4',
  updated_at = now()
WHERE slug = 'rolf-krafton-p5g-10w40';

UPDATE products SET
  api_spec = 'API CI-4/SL',
  acea_spec = 'ACEA A3/B4, ACEA E7',
  approvals = 'MB 228.3; CAT ECF-1a; CAT ECF-2; MTU oil category 2; MAN 3275-1; Cummins CES 20078; Mack EO-M-Plus; Mack EO-N; Renault RVI RLD-2; VOLVO VDS-3; Deutz DQC-III; ПАО «КАМАЗ»; ПАО «Автодизель» (ЯМЗ); ООО «ЛиАЗ»; ПАО «ТМЗ»',
  updated_at = now()
WHERE slug = 'rolf-krafton-p5u-10w40';

UPDATE products SET
  api_spec = 'API CI-4/CH-4/SL',
  acea_spec = 'ACEA E7-12',
  approvals = 'Cummins CES 20076/20077; Cummins CES 20078; Caterpillar ECF-1a; Mack EO-N; MAN M3275-1; MB 228.3; MTU oil category 2; Renault RVI RLD-2; Volvo VDS-3; Deutz DQC III; ПАО «КАМАЗ»',
  updated_at = now()
WHERE slug = 'rolf-krafton-p5ue-10w30';

UPDATE products SET
  api_spec = 'API CI-4/SL',
  acea_spec = 'ACEA A3/B4, ACEA E7',
  approvals = 'MB 228.3; CAT ECF-1a; CAT ECF-2; MTU oil category 2; MAN 3275-1; Cummins CES 20078; Mack EO-M-Plus; Mack EO-N; Renault RVI RLD-2; VOLVO VDS-3; Deutz DQC-III; ПАО «КАМАЗ»; ПАО «Автодизель» (ЯМЗ); ООО «ЛиАЗ»; ПАО «ТМЗ»',
  updated_at = now()
WHERE slug = 'rolf-krafton-m5u-15w40';

UPDATE products SET
  api_spec = 'API CI-4/SL',
  acea_spec = 'ACEA E7',
  approvals = 'MB 228.3; MAN M3275-1; MTU Oil Category 2; Deutz DQC III-10; Volvo VDS-3; Mack EO-M PLUS; Cummins CES 20078; CAT ECF-1a; Renault RLD-2; ПАО «ТМЗ»; ПАО «ЯМЗ»; ПАО «КАМАЗ»; ООО «ЛИАЗ»',
  updated_at = now()
WHERE slug = 'sintec-truck-10w40';

UPDATE products SET
  approvals = 'DIN 51524 (HVLP); ISO 11158 (HV); Bosch Rexroth RDE 90235; Parker (Denison) HF-0, HF-1, HF-2; Eaton Vickers E-FDGN TB002-E; ASTM D6158; SAE MS1004',
  updated_at = now()
WHERE slug = 'rolf-hydraulic-hvlp-32';

UPDATE products SET
  approvals = 'DIN 51524-3 (HVLP); ISO 11158 (HV); Bosch Rexroth RDE 90235; Parker (Denison) HF-0, HF-1, HF-2; Eaton Vickers E-FDGN-TB002-E; ASTM D6158; SAE MS1004',
  updated_at = now()
WHERE slug = 'rolf-hydraulic-hvlp-46';

UPDATE products SET
  approvals = 'GM DEXRON IIIG; Ford Mercon; ZF TE-ML 04D, 05L, 09, 11, 14A, 21L; Voith 55.6335/G.607; MAN 339 Z1/V1; Allison C-4/TES 389; CAT TO-2; Volvo CE 97340; MB 236.1',
  updated_at = now()
WHERE slug = 'rolf-atf-iii';

UPDATE products SET
  approvals = 'Scania STO 1:0; MAN 342 M2; ZF TE-ML 05A/07A/08/12E/16B/16C/16D/17B/19B/21A',
  updated_at = now()
WHERE slug = 'rolf-transmission-s7-ae-75w90';

-- ============================================
-- 7. CREATE NEW VARIANTS FROM PRICE LIST
-- ============================================

-- === МОТОРНЫЕ МАСЛА ===

-- ROLF Krafton P5 G 10W-40: розлив 500₽/л, 20л 10500₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 500, 500, 'литр', 1
FROM products p WHERE p.slug = 'rolf-krafton-p5g-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 10500, 525, 2
FROM products p WHERE p.slug = 'rolf-krafton-p5g-10w40';

-- ROLF Krafton P5 U 10W-40: 208л 72500₽, розлив 400₽/л, 20л 8400₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '208 л', 208, 72500, 348.56, 1
FROM products p WHERE p.slug = 'rolf-krafton-p5u-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 400, 400, 'литр', 2
FROM products p WHERE p.slug = 'rolf-krafton-p5u-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 8400, 420, 3
FROM products p WHERE p.slug = 'rolf-krafton-p5u-10w40';

-- ROLF Krafton P5 UE 10W-30: 208л 76200₽, розлив ~367₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '208 л', 208, 76200, 366.35, 1
FROM products p WHERE p.slug = 'rolf-krafton-p5ue-10w30';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 367, 367, 'литр', 2
FROM products p WHERE p.slug = 'rolf-krafton-p5ue-10w30';

-- ROLF Krafton M5 U 15W-40: 20л 7300₽, розлив ~365₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 7300, 365, 1
FROM products p WHERE p.slug = 'rolf-krafton-m5u-15w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 365, 365, 'литр', 2
FROM products p WHERE p.slug = 'rolf-krafton-m5u-15w40';

-- SINTEC Truck 10W-40: 20л 7600₽, розлив ~380₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 7600, 380, 1
FROM products p WHERE p.slug = 'sintec-truck-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 380, 380, 'литр', 2
FROM products p WHERE p.slug = 'sintec-truck-10w40';

-- ХИМАВТО 10W-40 CI-4/SL: 180кг 59100₽, 20л 6300₽, розлив ~286₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '180 кг', NULL, 59100, 286, 1
FROM products p WHERE p.slug = 'himavto-motor-10w40-ci4';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 6300, 315, 2
FROM products p WHERE p.slug = 'himavto-motor-10w40-ci4';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 286, 286, 'литр', 3
FROM products p WHERE p.slug = 'himavto-motor-10w40-ci4';

-- ХИМАВТО 10W-40 SL/CF: 180кг 54800₽, розлив ~265₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '180 кг', NULL, 54800, 265, 1
FROM products p WHERE p.slug = 'himavto-motor-10w40';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 265, 265, 'литр', 2
FROM products p WHERE p.slug = 'himavto-motor-10w40';

-- AKross PROFESSIONAL 15W-40: 180кг 55200₽, розлив ~267₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '180 кг', NULL, 55200, 267, 1
FROM products p WHERE p.slug = 'akross-15w40-ci4';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 267, 267, 'литр', 2
FROM products p WHERE p.slug = 'akross-15w40-ci4';

-- KIXX Outboard 2-Cycle Oil: 1л 1000₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '1 л', 1, 1000, 1000, 1
FROM products p WHERE p.slug = 'kixx-outboard-2cycle';

-- === ГИДРАВЛИЧЕСКИЕ МАСЛА ===

-- ROLF Hydraulic HVLP 32: 208л 66200₽, 20л 8000₽, розлив ~318₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '208 л', 208, 66200, 318.27, 1
FROM products p WHERE p.slug = 'rolf-hydraulic-hvlp-32';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 8000, 400, 2
FROM products p WHERE p.slug = 'rolf-hydraulic-hvlp-32';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 318, 318, 'литр', 3
FROM products p WHERE p.slug = 'rolf-hydraulic-hvlp-32';

-- ROLF Hydraulic HVLP 46: 208л 67900₽, 20л 7600₽, розлив ~326₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '208 л', 208, 67900, 326.44, 1
FROM products p WHERE p.slug = 'rolf-hydraulic-hvlp-46';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 7600, 380, 2
FROM products p WHERE p.slug = 'rolf-hydraulic-hvlp-46';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 326, 326, 'литр', 3
FROM products p WHERE p.slug = 'rolf-hydraulic-hvlp-46';

-- RhinOIL HVLP 32: 205л 65300₽, розлив ~319₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '205 л', 205, 65300, 318.54, 1
FROM products p WHERE p.slug = 'rhinoil-hvlp-32';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 319, 319, 'литр', 2
FROM products p WHERE p.slug = 'rhinoil-hvlp-32';

-- ХИМАВТО ВМГЗ -60: 170кг 47800₽, розлив ~245₽/л (170/0.87≈195л)
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '170 кг', NULL, 47800, 245, 1
FROM products p WHERE p.slug = 'himavto-vmgz-60';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 245, 245, 'литр', 2
FROM products p WHERE p.slug = 'himavto-vmgz-60';

-- ХИМАВТО ВМГЗ -45: бочка 39900₽, розлив ~205₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '170 кг', NULL, 39900, 205, 1
FROM products p WHERE p.slug = 'himavto-vmgz-45';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 205, 205, 'литр', 2
FROM products p WHERE p.slug = 'himavto-vmgz-45';

-- ХИМАВТО HVLP 32: розлив 300₽/л (прямо из прайса)
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 300, 300, 'литр', 1
FROM products p WHERE p.slug = 'himavto-hvlp-32';

-- ХИМАВТО HVLP 46: 170кг 46800₽, розлив ~240₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '170 кг', NULL, 46800, 240, 1
FROM products p WHERE p.slug = 'himavto-hvlp-46';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 240, 240, 'литр', 2
FROM products p WHERE p.slug = 'himavto-hvlp-46';

-- ХИМАВТО Масло «А»: 170кг 40500₽, розлив ~208₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '170 кг', NULL, 40500, 208, 1
FROM products p WHERE p.slug = 'himavto-maslo-a';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 208, 208, 'литр', 2
FROM products p WHERE p.slug = 'himavto-maslo-a';

-- === ТРАНСМИССИОННЫЕ МАСЛА ===

-- ROLF ATF III: 208л 73500₽, розлив ~353₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '208 л', 208, 73500, 353.37, 1
FROM products p WHERE p.slug = 'rolf-atf-iii';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 353, 353, 'литр', 2
FROM products p WHERE p.slug = 'rolf-atf-iii';

-- ROLF Transmission S7 AE 75W-90: 208л 135400₽, розлив 700₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '208 л', 208, 135400, 651, 1
FROM products p WHERE p.slug = 'rolf-transmission-s7-ae-75w90';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 700, 700, 'литр', 2
FROM products p WHERE p.slug = 'rolf-transmission-s7-ae-75w90';

-- ХИМАВТО 80W-90 GL-5: бочка 47000₽, розлив ~241₽/л (assuming ~195л from 170кг)
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, 'бочка', NULL, 47000, 241, 1
FROM products p WHERE p.slug = 'himavto-trans-80w90-gl5';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 241, 241, 'литр', 2
FROM products p WHERE p.slug = 'himavto-trans-80w90-gl5';

-- KIXX Geartec GL-4 80W-90: бочка 76300₽, розлив ~367₽/л (assuming 208л)
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, 'бочка', NULL, 76300, 367, 1
FROM products p WHERE p.slug = 'kixx-geartec-80w90-gl4';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 367, 367, 'литр', 2
FROM products p WHERE p.slug = 'kixx-geartec-80w90-gl4';

-- === СМАЗКИ (no розлив) ===

-- Volga Oil EP-2: 18кг 10000₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '18 кг', NULL, 10000, NULL, 1
FROM products p WHERE p.slug = 'volga-ep2';

-- Volga Oil Литол-24: 18кг 9500₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '18 кг', NULL, 9500, NULL, 1
FROM products p WHERE p.slug = 'volga-litol-24';

-- KIXX GS Grease Moly EP 2: 15кг 17700₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '15 кг', NULL, 17700, NULL, 1
FROM products p WHERE p.slug = 'kixx-grease-moly-ep2';

-- KIXX Grease WR 2: 0.39кг 800₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '0.39 кг', NULL, 800, NULL, 1
FROM products p WHERE p.slug = 'kixx-grease-wr2';

-- KIXX Grease WR M2: 0.39кг 800₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '0.39 кг', NULL, 800, NULL, 1
FROM products p WHERE p.slug = 'kixx-grease-wrm2';

-- === АНТИФРИЗЫ / ТОСОЛ (kg, no розлив) ===

-- ROLF G12+ red -40: 208л 51300₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '208 л', 208, 51300, NULL, 1
FROM products p WHERE p.slug = 'rolf-coolant-g12';

-- SINTEC G12+ red -40: 220кг 44700₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '220 кг', NULL, 44700, NULL, 1
FROM products p WHERE p.slug = 'sintec-coolant-g12';

-- ХИМАВТО G12 RED -40: 10кг 2100₽, 5кг 1100₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '10 кг', NULL, 2100, NULL, 1
FROM products p WHERE p.slug = 'himavto-g12-40-red';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '5 кг', NULL, 1100, NULL, 2
FROM products p WHERE p.slug = 'himavto-g12-40-red';

-- Savtok Premium 40 Тосол: 225кг 32200₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '225 кг', NULL, 32200, NULL, 1
FROM products p WHERE p.slug = 'savtok-tosol-premium40';

-- ГОСТ Тосол А-40 синий: 20кг 3300₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 кг', NULL, 3300, NULL, 1
FROM products p WHERE p.slug = 'gost-tosol-a40';

-- === ТОРМОЗНЫЕ ЖИДКОСТИ (no розлив) ===

-- ХИМАВТО DOT-4 Plus: 0.455кг 200₽, 0.910кг 400₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '0.455 кг', NULL, 200, NULL, 1
FROM products p WHERE p.slug = 'himavto-dot4-plus';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '0.910 кг', NULL, 400, NULL, 2
FROM products p WHERE p.slug = 'himavto-dot4-plus';

-- === ИНДУСТРИАЛЬНЫЕ МАСЛА ===

-- RhinOIL CLP 68: 20л 7900₽, розлив ~395₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 7900, 395, 1
FROM products p WHERE p.slug = 'rhinoil-clp68';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 395, 395, 'литр', 2
FROM products p WHERE p.slug = 'rhinoil-clp68';

-- RhinOIL VDL-32 S: 20л 12600₽, розлив ~630₽/л
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '20 л', 20, 12600, 630, 1
FROM products p WHERE p.slug = 'rhinoil-vdl32s';

INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, unit, sort_order)
SELECT p.id, 'Розлив', NULL, 630, 630, 'литр', 2
FROM products p WHERE p.slug = 'rhinoil-vdl32s';

-- === АВТОХИМИЯ ===

-- Sintec Арктика -20: 4л 700₽
INSERT INTO product_variants (product_id, volume, volume_liters, price, price_per_liter, sort_order)
SELECT p.id, '4 л', 4, 700, 175, 1
FROM products p WHERE p.slug = 'sintec-arktika-20';
