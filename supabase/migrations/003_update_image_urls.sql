-- Migration: Update product image URLs to point to Supabase Storage
-- Bucket: product-images (public)
-- URL format: https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/{brand}/{filename}

-- ROLF products
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rolf/P5U.png' WHERE slug = 'rolf-krafton-p5u-10w40';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rolf/P5G.png' WHERE slug = 'rolf-krafton-p5g-10w40';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rolf/P5UE-10W30.png' WHERE slug = 'rolf-krafton-p5ue-10w30';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rolf/M5U.png' WHERE slug = 'rolf-krafton-m5u-15w40';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rolf/S9M.png' WHERE slug = 'rolf-krafton-s9m-5w30';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rolf/ATF-III.png' WHERE slug = 'rolf-atf-iii';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rolf/S7-AE.png' WHERE slug = 'rolf-transmission-s7-ae-75w90';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rolf/HVLP-32.png' WHERE slug = 'rolf-hydraulic-hvlp-32';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rolf/HVLP-46.png' WHERE slug = 'rolf-hydraulic-hvlp-46';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rolf/G12.png' WHERE slug = 'rolf-coolant-g12';

-- KIXX products
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/kixx/80W-90-GL4.png' WHERE slug = 'kixx-geartec-80w90-gl4';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/kixx/80W-90-GL5.png' WHERE slug = 'kixx-geartec-80w90-gl5';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/kixx/Grease-EP2.png' WHERE slug = 'kixx-grease-ep2';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/kixx/Grease-WR-2.png' WHERE slug = 'kixx-grease-wr2';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/kixx/Grease-WR-M2.png' WHERE slug = 'kixx-grease-wrm2';

-- RhinOIL products
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rhinoil/15w-40-CI-4.png' WHERE slug = 'rhinoil-motor-15w40-ci4';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rhinoil/75-90-GL4-GL5.png' WHERE slug = 'rhinoil-trans-75w90-gl4gl5';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rhinoil/HVLP-32.png' WHERE slug = 'rhinoil-hvlp-32';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rhinoil/CLP68.png' WHERE slug = 'rhinoil-clp68';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rhinoil/G12-65-RED.png' WHERE slug = 'rhinoil-g12-65-red';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rhinoil/G11-GREEN-40.png' WHERE slug = 'rhinoil-g11-green-40';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/rhinoil/G11-RED-40.png' WHERE slug = 'rhinoil-g11-red-40';

-- ХимАвто products
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/10W-40.png' WHERE slug = 'himavto-motor-10w40';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/10W-40-CI-4.png' WHERE slug = 'himavto-motor-10w40-ci4';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/75-90.png' WHERE slug = 'himavto-trans-75w90';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/80-90-GL5.png' WHERE slug = 'himavto-trans-80w90-gl5';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/75-90-GL5.png' WHERE slug = 'himavto-trans-75w90-gl5';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/HVLP-32.png' WHERE slug = 'himavto-hvlp-32';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/HVLP-46.png' WHERE slug = 'himavto-hvlp-46';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/VMGZ-45.png' WHERE slug = 'himavto-vmgz-45';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/VMGZ-60.png' WHERE slug = 'himavto-vmgz-60';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/G12-40-RED.png' WHERE slug = 'himavto-g12-40-red';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/G12-65-RED.png' WHERE slug = 'himavto-g12-65-red';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/himavto/DOT4-Plus.png' WHERE slug = 'himavto-dot4-plus';

-- Sintec products
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/sintec/Truck-10w-40.png' WHERE slug = 'sintec-truck-10w40';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/sintec/G12.png' WHERE slug = 'sintec-coolant-g12';

-- Volga products
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/volga/M10DM.png' WHERE slug = 'volga-m10dm';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/volga/EP-2.png' WHERE slug = 'volga-ep2';
UPDATE products SET image_url = 'https://tylxmgxmsyegqcdfyxsp.supabase.co/storage/v1/object/public/product-images/volga/Litol-24.png' WHERE slug = 'volga-litol-24';
