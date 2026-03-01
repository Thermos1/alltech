-- =============================================
-- 008: CRM Enhancements
-- client_notes, activity_log, shared_carts, stock decrement
-- =============================================

-- 1. Client Notes
CREATE TABLE IF NOT EXISTS client_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES profiles(id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_created ON client_notes(client_id, created_at DESC);

ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage notes" ON client_notes
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Manager manage own client notes" ON client_notes
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
    AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = client_notes.client_id AND p.manager_id = auth.uid()
    )
  );

-- 2. Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID NOT NULL REFERENCES profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  details     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read all activity" ON activity_log
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Manager read own activity" ON activity_log
  FOR SELECT USING (auth.uid() = actor_id);

-- Insert policy for service role (activity is logged server-side via admin client)
CREATE POLICY "Service insert activity" ON activity_log
  FOR INSERT WITH CHECK (true);

-- 3. Shared Carts
CREATE TABLE IF NOT EXISTS shared_carts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL,
  manager_id   UUID NOT NULL REFERENCES profiles(id),
  client_id    UUID REFERENCES profiles(id),
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'ordered', 'expired')),
  order_id     UUID REFERENCES orders(id),
  notes        TEXT,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shared_cart_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_cart_id  UUID NOT NULL REFERENCES shared_carts(id) ON DELETE CASCADE,
  variant_id      UUID NOT NULL REFERENCES product_variants(id),
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  note            TEXT
);

CREATE INDEX IF NOT EXISTS idx_shared_carts_code ON shared_carts(code);
CREATE INDEX IF NOT EXISTS idx_shared_carts_manager ON shared_carts(manager_id);
CREATE INDEX IF NOT EXISTS idx_shared_carts_client ON shared_carts(client_id);
CREATE INDEX IF NOT EXISTS idx_shared_cart_items_cart ON shared_cart_items(shared_cart_id);

ALTER TABLE shared_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage shared carts" ON shared_carts
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

CREATE POLICY "Staff manage shared cart items" ON shared_cart_items
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

-- 4. Stock decrement function (safe, prevents going below 0)
CREATE OR REPLACE FUNCTION decrement_stock(p_variant_id UUID, p_quantity INT)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET stock_qty = GREATEST(stock_qty - p_quantity, 0),
      updated_at = now()
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
