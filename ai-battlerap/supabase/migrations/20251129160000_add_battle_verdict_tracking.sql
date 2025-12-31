-- ============================================================================
-- Add Verdict and Decision Type Tracking to Battles
-- ============================================================================
-- This migration adds columns to track battle outcomes with battle rap terminology:
-- - verdict: '3-0' or '2-1'
-- - decision_type: Specific classification (bodybag, classic, edge, etc.)

ALTER TABLE battles
ADD COLUMN IF NOT EXISTS verdict TEXT CHECK (verdict IN ('3-0', '2-1')),
ADD COLUMN IF NOT EXISTS decision_type TEXT CHECK (decision_type IN (
  'bodybag',           -- 3-0 dominated/crushed
  'clean_sweep',       -- 3-0 won all rounds clearly
  'gentlemans_30',     -- 3-0 swept but opponent performed well
  'classic',           -- 2-1 both gave great performances, high crowd
  'edge'               -- 2-1 very close, debatable rounds
));

COMMENT ON COLUMN battles.verdict IS '3-0 or 2-1 scoreline';
COMMENT ON COLUMN battles.decision_type IS 'Classification: bodybag, clean_sweep, gentlemans_30, classic, or edge';

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_battles_verdict ON battles(verdict);
CREATE INDEX IF NOT EXISTS idx_battles_decision_type ON battles(decision_type);
