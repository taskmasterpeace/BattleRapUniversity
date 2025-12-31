/**
 * Add RLS Policy to battle_progression Table
 *
 * SECURITY FIX: The battle_progression table was created without RLS enabled,
 * allowing any authenticated user to read/modify progression data.
 *
 * This migration:
 * - Enables Row Level Security on battle_progression
 * - Allows anyone to read battle progression (public battle results)
 * - Restricts writes to service role only (happens during simulation)
 */

-- Enable RLS
ALTER TABLE battle_progression ENABLE ROW LEVEL SECURITY;

-- Anyone can read battle progression (public battle results)
CREATE POLICY "Anyone can read battle progression"
  ON battle_progression
  FOR SELECT
  USING (true);

-- Only service role can write (happens during simulation)
-- Regular users should NOT manually modify progression data
CREATE POLICY "Service role can manage battle progression"
  ON battle_progression
  FOR ALL
  USING (false);

COMMENT ON TABLE battle_progression IS
  'RLS enabled: Read-only for users, write-only for service role';
