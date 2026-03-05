-- Add delivery_address to profiles for remembering last used address
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_address TEXT;
