-- Тестовые промокоды
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, is_active)
VALUES
  ('WELCOME10', 'percent', 10, 1000, NULL, true),
  ('АЛТЕХ500', 'fixed', 500, 5000, 100, true),
  ('ЯКУТСК15', 'percent', 15, 3000, 50, true)
ON CONFLICT (code) DO NOTHING;

-- RLS-политики для admin роли

-- Admin может читать все заказы
CREATE POLICY "Admin read all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin может обновлять все заказы (смена статуса)
CREATE POLICY "Admin update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin может читать все позиции заказов
CREATE POLICY "Admin read all order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin может читать все профили
CREATE POLICY "Admin read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admin может управлять промокодами
CREATE POLICY "Admin manage promo codes" ON promo_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Пользователи могут создавать свои заказы
CREATE POLICY "Users create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут создавать позиции своих заказов
CREATE POLICY "Users create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
