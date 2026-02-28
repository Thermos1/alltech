-- Commission log — per-order history of manager commissions
-- Replaces blind accumulator in profiles.manager_commission

CREATE TABLE commission_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id  UUID NOT NULL REFERENCES profiles(id),
  order_id    UUID NOT NULL REFERENCES orders(id),
  order_total NUMERIC(12,2) NOT NULL,
  rate        NUMERIC(5,2) NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_commission_log_manager ON commission_log(manager_id);
CREATE INDEX idx_commission_log_created ON commission_log(created_at);
CREATE INDEX idx_commission_log_manager_month ON commission_log(manager_id, created_at);

-- Unique constraint: one commission per order per manager
CREATE UNIQUE INDEX idx_commission_log_unique ON commission_log(manager_id, order_id);

-- RLS: managers can read their own commission log
ALTER TABLE commission_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers read own commissions"
  ON commission_log FOR SELECT
  USING (auth.uid() = manager_id);
