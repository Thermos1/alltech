-- Fix: handle_new_user() now resolves referral_code → referred_by
-- Previously, referral_code from auth metadata was ignored

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_id UUID;
BEGIN
  -- Read referral code from signup metadata
  ref_code := NEW.raw_user_meta_data->>'referral_code';

  -- Resolve referral code to referrer profile ID
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    SELECT id INTO referrer_id
    FROM profiles
    WHERE referral_code = ref_code;
  END IF;

  INSERT INTO profiles (id, phone, full_name, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'ALT-' || substr(md5(NEW.id::text), 1, 8),
    referrer_id  -- NULL if no valid referral code
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
