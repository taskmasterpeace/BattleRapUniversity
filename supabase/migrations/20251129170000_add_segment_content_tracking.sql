-- ============================================================================
-- Add Segment-Level Content Tracking
-- ============================================================================
-- This migration adds columns to track what content/delivery/performance was
-- used in each segment. This enables judges and bloggers to evaluate actual
-- performance, not just badges.

ALTER TABLE battle_segments
ADD COLUMN IF NOT EXISTS primary_content_type TEXT,
ADD COLUMN IF NOT EXISTS secondary_content_type TEXT,
ADD COLUMN IF NOT EXISTS delivery_type TEXT,
ADD COLUMN IF NOT EXISTS performance_type TEXT,
ADD COLUMN IF NOT EXISTS content_effectiveness NUMERIC DEFAULT 1.0;

COMMENT ON COLUMN battle_segments.primary_content_type IS 'Main content type used in segment (wordplay, personals, comedy, etc.)';
COMMENT ON COLUMN battle_segments.secondary_content_type IS 'Secondary content if segment was hybrid/mixed';
COMMENT ON COLUMN battle_segments.delivery_type IS 'Delivery style used (aggressive, smooth_flow, speed_rapping, etc.)';
COMMENT ON COLUMN battle_segments.performance_type IS 'Performance style (stage_presence, crowd_interaction, theatrical, etc.)';
COMMENT ON COLUMN battle_segments.content_effectiveness IS 'Effectiveness multiplier for this segments content matchup (0.5-2.0)';

-- Create indexes for content analysis queries
CREATE INDEX IF NOT EXISTS idx_segments_primary_content ON battle_segments(primary_content_type);
CREATE INDEX IF NOT EXISTS idx_segments_delivery ON battle_segments(delivery_type);
CREATE INDEX IF NOT EXISTS idx_segments_performance ON battle_segments(performance_type);
