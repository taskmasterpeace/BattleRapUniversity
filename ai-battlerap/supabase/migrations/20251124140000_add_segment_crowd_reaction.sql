-- Add segment-level crowd reaction tracking
-- This allows us to identify which specific segments got the biggest crowd reactions
-- for more detailed battle narratives in blog generation

ALTER TABLE battle_segments
ADD COLUMN crowd_reaction INT CHECK (crowd_reaction >= 0 AND crowd_reaction <= 100);

COMMENT ON COLUMN battle_segments.crowd_reaction IS 'Segment-level crowd reaction score (0-100). Haymaker segments get +15 bonus. Used to identify peak crowd moments for blog generation.';
