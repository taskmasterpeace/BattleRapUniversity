-- ============================================================================
-- Add role and email columns to profiles
-- ============================================================================

-- Add email column for easier lookups
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add role column with default 'player'
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'player'
CHECK (role IN ('player', 'commissioner', 'admin'));

-- Add updated_at column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Set taskmasterpeace@gmail.com as admin if they exist
UPDATE profiles
SET role = 'admin'
WHERE email = 'taskmasterpeace@gmail.com';

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'User roles migration complete';
END $$;
