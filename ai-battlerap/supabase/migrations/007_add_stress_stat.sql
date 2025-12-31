-- Migration: Add stress as a hidden stat to battler_attributes
-- Stress accumulates from behavior patterns and affects choke probability and prep efficiency

-- Add stress field to battler_attributes
ALTER TABLE battler_attributes
ADD COLUMN stress numeric NOT NULL DEFAULT 0 CHECK (stress >= 0 AND stress <= 100);

-- Add comment explaining stress
COMMENT ON COLUMN battler_attributes.stress IS 'Hidden stat (0-100) that accumulates from back-to-back battles, high prep intensity, and life events. Affects choke probability and prep efficiency.';

-- Update existing battlers to have 0 stress
UPDATE battler_attributes SET stress = 0 WHERE stress IS NULL;

-- Create index for querying high-stress battlers
CREATE INDEX IF NOT EXISTS idx_battler_attributes_stress ON battler_attributes(stress DESC);
