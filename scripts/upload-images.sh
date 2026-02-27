#!/bin/bash
# Upload all product images to Supabase Storage
# Run from project root: bash scripts/upload-images.sh

set -e

SUPABASE_URL="https://tylxmgxmsyegqcdfyxsp.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bHhtZ3htc3llZ3FjZGZ5eHNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE3NjM5NSwiZXhwIjoyMDg3NzUyMzk1fQ.ZcC1VtmSki1FsZZnAV6-N34laTggJv3IyrNcimvQFSo"
ICONS_DIR="/Users/macbook/ClaudeProjects /alltech/docs/Иконки финал"
BUCKET="product-images"

echo "=== Step 1: Create storage bucket ==="
curl -s -X POST "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"id":"product-images","name":"product-images","public":true}'
echo ""
echo "Bucket created (or already exists)."
echo ""

upload() {
  local src="$1"
  local dest="$2"
  echo "Uploading: ${dest}"
  local response
  response=$(curl -s -X POST "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${dest}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: image/png" \
    --data-binary @"${src}")
  echo "  -> ${response}"
}

echo "=== Step 2: Upload all product images ==="

# ROLF - Моторные
upload "${ICONS_DIR}/Rolf/Моторные/P5U.png" "rolf/P5U.png"
upload "${ICONS_DIR}/Rolf/Моторные/P5G.png" "rolf/P5G.png"
upload "${ICONS_DIR}/Rolf/Моторные/P5UE 10W30.png" "rolf/P5UE-10W30.png"
upload "${ICONS_DIR}/Rolf/Моторные/M5U.png" "rolf/M5U.png"
upload "${ICONS_DIR}/Rolf/Моторные/S9M.png" "rolf/S9M.png"

# ROLF - Трансмиссионные
upload "${ICONS_DIR}/Rolf/Трансмиссионные/ATF III.png" "rolf/ATF-III.png"
upload "${ICONS_DIR}/Rolf/Трансмиссионные/S7 AE.png" "rolf/S7-AE.png"

# ROLF - Гидравлические
upload "${ICONS_DIR}/Rolf/Гидравлические/HVLP-32.png" "rolf/HVLP-32.png"
upload "${ICONS_DIR}/Rolf/Гидравлические/HVLP-46.png" "rolf/HVLP-46.png"

# ROLF - Охлаждающие жидкости
upload "${ICONS_DIR}/Rolf/Охлаждающие жидкости/G12.png" "rolf/G12.png"

# KIXX - Трансмиссионные
upload "${ICONS_DIR}/KIXX/Трансмиссионные/80W-90 GL4.png" "kixx/80W-90-GL4.png"
upload "${ICONS_DIR}/KIXX/Трансмиссионные/80W-90 GL5.png" "kixx/80W-90-GL5.png"

# KIXX - Смазки
upload "${ICONS_DIR}/KIXX/Смазки/Grease EP2.png" "kixx/Grease-EP2.png"
upload "${ICONS_DIR}/KIXX/Смазки/Grease WR 2.png" "kixx/Grease-WR-2.png"
upload "${ICONS_DIR}/KIXX/Смазки/Grease WR M2.png" "kixx/Grease-WR-M2.png"

# RhinOIL - Моторное
upload "${ICONS_DIR}/RhinOIl/Моторное/15w-40 CI-4.png" "rhinoil/15w-40-CI-4.png"

# RhinOIL - Трансмиссионные
upload "${ICONS_DIR}/RhinOIl/Трансмиссионные/75-90 GL4-GL5.png" "rhinoil/75-90-GL4-GL5.png"

# RhinOIL - Гидравлическое
upload "${ICONS_DIR}/RhinOIl/Гидравлическое/HVLP-32.png" "rhinoil/HVLP-32.png"

# RhinOIL - Редукторное
upload "${ICONS_DIR}/RhinOIl/Редукторное/CLP68.png" "rhinoil/CLP68.png"

# RhinOIL - Охлаждающие
upload "${ICONS_DIR}/RhinOIl/Охлаждающие/G12 -65 RED.png" "rhinoil/G12-65-RED.png"
upload "${ICONS_DIR}/RhinOIl/Охлаждающие/G11 GREEN -40.png" "rhinoil/G11-GREEN-40.png"
upload "${ICONS_DIR}/RhinOIl/Охлаждающие/G11 RED -40.png" "rhinoil/G11-RED-40.png"

# ХимАвто - Моторное
upload "${ICONS_DIR}/ХимАвто/Моторное/10W-40.png" "himavto/10W-40.png"
upload "${ICONS_DIR}/ХимАвто/Моторное/10W-40 CI-4.png" "himavto/10W-40-CI-4.png"

# ХимАвто - Трансимиссиное
upload "${ICONS_DIR}/ХимАвто/Трансимиссиное/75-90.png" "himavto/75-90.png"
upload "${ICONS_DIR}/ХимАвто/Трансимиссиное/80-90 GL5.png" "himavto/80-90-GL5.png"
upload "${ICONS_DIR}/ХимАвто/Трансимиссиное/75-90 GL5.png" "himavto/75-90-GL5.png"

# ХимАвто - Гидравлическое
upload "${ICONS_DIR}/ХимАвто/Гидравлическое/ХИМАВТО HVLP-32.png" "himavto/HVLP-32.png"
upload "${ICONS_DIR}/ХимАвто/Гидравлическое/ХИМАВТО HVLP-46.png" "himavto/HVLP-46.png"
upload "${ICONS_DIR}/ХимАвто/Гидравлическое/ХИМАВТО ВМГЗ-45.png" "himavto/VMGZ-45.png"
upload "${ICONS_DIR}/ХимАвто/Гидравлическое/ХИМАВТО ВМГЗ-60.png" "himavto/VMGZ-60.png"

# ХимАвто - Охлаждающие жидкости
upload "${ICONS_DIR}/ХимАвто/Охлаждающие жидкости/ХИМАВТО G12 -40 RED PROFESSIONAL.png" "himavto/G12-40-RED.png"
upload "${ICONS_DIR}/ХимАвто/Охлаждающие жидкости/ХИМАВТО G12 -65 RED PROFESSIONAL.png" "himavto/G12-65-RED.png"

# ХимАвто - Тормозная жидкость
upload "${ICONS_DIR}/ХимАвто/Тормозная жидкость/DOT4-Plus.png" "himavto/DOT4-Plus.png"

# Sintec - Моторные масла
upload "${ICONS_DIR}/Sintec/Моторные масла/Truck 10w-40.png" "sintec/Truck-10w-40.png"

# Sintec - Охлаждающие жидкости
upload "${ICONS_DIR}/Sintec/Охлаждающие жидкости/G12.png" "sintec/G12.png"

# Volga - Моторное масло
upload "${ICONS_DIR}/Volga/Моторное масло/М10ДМ.png" "volga/M10DM.png"

# Volga - Смазки
upload "${ICONS_DIR}/Volga/Смазки/EP-2.png" "volga/EP-2.png"
upload "${ICONS_DIR}/Volga/Смазки/Литол-24.png" "volga/Litol-24.png"

echo ""
echo "=== Step 3: Copy logo images to public/images/ ==="

PROJECT_DIR="/Users/macbook/ClaudeProjects /alltech/altech-store"
mkdir -p "${PROJECT_DIR}/public/images"

cp "${ICONS_DIR}/Лого белое АЛТЕХ.png" "${PROJECT_DIR}/public/images/logo-white.png"
cp "${ICONS_DIR}/АЛТЕХ черный.png" "${PROJECT_DIR}/public/images/logo-dark.png"
cp "${ICONS_DIR}/Фон Эмблема.png" "${PROJECT_DIR}/public/images/emblem.png"

echo "Logo images copied to public/images/"
echo ""

echo "=== All uploads complete! ==="
echo ""
echo "Total product images uploaded: 40"
echo ""
echo "=== Step 5: Apply migration ==="
echo "Run the following command to apply the migration:"
echo "  cd \"${PROJECT_DIR}\" && npx supabase db push --linked"
echo ""
echo "=== Step 7: Verify ==="
echo "Test this URL in your browser:"
echo "  ${SUPABASE_URL}/storage/v1/object/public/product-images/rolf/P5U.png"
