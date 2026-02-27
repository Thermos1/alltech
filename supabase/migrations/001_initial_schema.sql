-- АЛТЕХ Store — Initial Schema
-- Brands, Categories, Products, Variants

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE product_section AS ENUM ('lubricants', 'filters');
CREATE TYPE oil_base_type AS ENUM ('synthetic', 'semi_synthetic', 'mineral');
CREATE TYPE order_status AS ENUM (
  'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);
CREATE TYPE payment_status AS ENUM (
  'pending', 'waiting_for_capture', 'succeeded', 'cancelled'
);

-- ============================================
-- BRANDS
-- ============================================
CREATE TABLE brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  logo_url    TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CATEGORIES (two-level hierarchy)
-- ============================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  section     product_section NOT NULL,
  parent_id   UUID REFERENCES categories(id),
  icon_url    TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  brand_id        UUID NOT NULL REFERENCES brands(id),
  category_id     UUID NOT NULL REFERENCES categories(id),
  section         product_section NOT NULL,

  -- Lubricant-specific
  viscosity       TEXT,
  base_type       oil_base_type,
  api_spec        TEXT,
  acea_spec       TEXT,
  approvals       TEXT,
  oem_approvals   TEXT[],

  -- Filter-specific
  filter_type     TEXT,
  oem_number      TEXT,
  cross_references TEXT[],

  -- Common
  image_url       TEXT,
  images          TEXT[],
  specs           JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  is_featured     BOOLEAN DEFAULT false,
  sort_order      INT DEFAULT 0,
  meta_title      TEXT,
  meta_description TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_section ON products(section);
CREATE INDEX idx_products_slug ON products(slug);

-- ============================================
-- PRODUCT VARIANTS (packaging / volume options)
-- ============================================
CREATE TABLE product_variants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  volume        TEXT NOT NULL,
  volume_liters NUMERIC,
  unit          TEXT DEFAULT 'шт',
  price         NUMERIC(10,2) NOT NULL,
  price_per_liter NUMERIC(10,2),
  sku           TEXT UNIQUE,
  stock_qty     INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);

-- ============================================
-- VEHICLE COMPATIBILITY
-- ============================================
CREATE TABLE vehicle_brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  logo_url    TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true
);

CREATE TABLE vehicle_models (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_brand_id UUID NOT NULL REFERENCES vehicle_brands(id),
  name            TEXT NOT NULL,
  engine_models   TEXT[],
  sort_order      INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true
);

CREATE TABLE engine_models (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true
);

CREATE TABLE product_vehicle_compatibility (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  vehicle_brand_id UUID REFERENCES vehicle_brands(id),
  vehicle_model_id UUID REFERENCES vehicle_models(id),
  engine_model_id  UUID REFERENCES engine_models(id),
  notes           TEXT
);

CREATE INDEX idx_compat_product ON product_vehicle_compatibility(product_id);
CREATE INDEX idx_compat_vehicle ON product_vehicle_compatibility(vehicle_brand_id);
CREATE INDEX idx_compat_engine ON product_vehicle_compatibility(engine_model_id);

-- ============================================
-- USER PROFILES
-- ============================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone           TEXT,
  full_name       TEXT,
  company_name    TEXT,
  inn             TEXT,
  role            TEXT DEFAULT 'customer',
  bonus_balance   INT DEFAULT 0,
  referral_code   TEXT UNIQUE,
  referred_by     UUID REFERENCES profiles(id),
  saved_vehicles  JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, phone, full_name, referral_code)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'ALT-' || substr(md5(NEW.id::text), 1, 8)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- CART
-- ============================================
CREATE TABLE cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_id  UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, variant_id)
);

-- ============================================
-- PROMO CODES
-- ============================================
CREATE TABLE promo_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value  NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_uses        INT,
  used_count      INT DEFAULT 0,
  valid_from      TIMESTAMPTZ,
  valid_until     TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  status          order_status DEFAULT 'pending',
  delivery_address TEXT,
  delivery_notes  TEXT,
  contact_phone   TEXT NOT NULL,
  contact_name    TEXT NOT NULL,
  subtotal        NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  bonus_used      INT DEFAULT 0,
  delivery_cost   NUMERIC(12,2) DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL,
  promo_code_id   UUID REFERENCES promo_codes(id),
  payment_status  payment_status DEFAULT 'pending',
  yookassa_payment_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id    UUID NOT NULL REFERENCES product_variants(id),
  product_name  TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  quantity      INT NOT NULL,
  unit_price    NUMERIC(10,2) NOT NULL,
  total_price   NUMERIC(10,2) NOT NULL
);

-- ============================================
-- BANNERS
-- ============================================
CREATE TABLE banners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  subtitle    TEXT,
  image_url   TEXT NOT NULL,
  link_url    TEXT,
  position    TEXT DEFAULT 'home_top',
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  valid_from  TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- REFERRAL EVENTS
-- ============================================
CREATE TABLE referral_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referred_id UUID NOT NULL REFERENCES profiles(id),
  order_id    UUID REFERENCES orders(id),
  bonus_awarded INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Public read for catalog
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (is_active = true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (is_active = true);

ALTER TABLE vehicle_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicle brands" ON vehicle_brands FOR SELECT USING (is_active = true);

ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read vehicle models" ON vehicle_models FOR SELECT USING (is_active = true);

ALTER TABLE engine_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read engine models" ON engine_models FOR SELECT USING (is_active = true);

ALTER TABLE product_vehicle_compatibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read compat" ON product_vehicle_compatibility FOR SELECT USING (true);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (is_active = true);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active promos" ON promo_codes FOR SELECT USING (is_active = true);

-- User-owned data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
