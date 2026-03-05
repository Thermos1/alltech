-- Add last_purchase_at for cashback decay tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_purchase_at TIMESTAMPTZ;

-- Backfill from existing paid orders
UPDATE profiles p SET last_purchase_at = (
  SELECT MAX(o.updated_at) FROM orders o
  WHERE o.user_id = p.id AND o.payment_status = 'succeeded'
) WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = p.id AND o.payment_status = 'succeeded'
);
