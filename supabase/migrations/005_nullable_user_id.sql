-- Allow guest orders (e.g., voice orders via SIPmind)
-- by making user_id nullable in orders table
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add a guest_phone column for identifying guest orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Update RLS: allow service_role to insert orders without user_id
-- (SIPmind API uses admin client with service_role key)
