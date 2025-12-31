/**
 * Manager History Tracking System
 *
 * Tracks the history of which managers have managed each battler.
 * When a battler leaves a manager, they develop grudges against
 * that manager's other battlers.
 */

-- ========================================
-- ADD MANAGER_ID TO BATTLERS TABLE
-- ========================================

-- Add manager_id column to battlers if it doesn't exist
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES profiles(id);

-- Create index for manager lookups
CREATE INDEX IF NOT EXISTS idx_battlers_manager ON battlers(manager_id);

-- ========================================
-- MANAGER HISTORY TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS manager_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- When did this management relationship exist?
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ, -- NULL means currently active

  -- How did it end?
  end_reason TEXT, -- 'released', 'signed_away', 'retired', 'fired'

  -- Stats during this tenure
  tenure_wins INTEGER DEFAULT 0,
  tenure_losses INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure no duplicate active management
  CONSTRAINT unique_active_management UNIQUE (battler_id, manager_id, ended_at)
);

-- Indexes for fast lookups
CREATE INDEX idx_manager_history_battler ON manager_history(battler_id);
CREATE INDEX idx_manager_history_manager ON manager_history(manager_id);
CREATE INDEX idx_manager_history_active ON manager_history(battler_id) WHERE ended_at IS NULL;

-- ========================================
-- MANAGER GRUDGES TABLE
-- ========================================

-- When a battler leaves a manager, they hold grudges against
-- that manager's roster (current and future battlers)
CREATE TABLE IF NOT EXISTS manager_grudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The battler who holds the grudge
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- The manager they have beef with
  ex_manager_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- How strong is the grudge? (1-10)
  intensity INTEGER DEFAULT 5 CHECK (intensity >= 1 AND intensity <= 10),

  -- What caused it?
  reason TEXT, -- 'released', 'signed_away', 'mistreated', 'underpaid'

  -- When did this grudge form?
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Grudges can fade over time
  faded_at TIMESTAMPTZ, -- NULL means still active

  CONSTRAINT unique_grudge UNIQUE (battler_id, ex_manager_id)
);

CREATE INDEX idx_manager_grudges_battler ON manager_grudges(battler_id);
CREATE INDEX idx_manager_grudges_manager ON manager_grudges(ex_manager_id);
CREATE INDEX idx_manager_grudges_active ON manager_grudges(battler_id) WHERE faded_at IS NULL;

-- ========================================
-- FUNCTION: Record Manager Change
-- ========================================

CREATE OR REPLACE FUNCTION record_manager_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If manager_id is being changed (not just set for first time)
  IF OLD.manager_id IS NOT NULL AND OLD.manager_id != NEW.manager_id THEN
    -- End the old management relationship
    UPDATE manager_history
    SET
      ended_at = now(),
      end_reason = 'signed_away'
    WHERE battler_id = NEW.id
      AND manager_id = OLD.manager_id
      AND ended_at IS NULL;

    -- Create a grudge against the old manager
    INSERT INTO manager_grudges (battler_id, ex_manager_id, intensity, reason)
    VALUES (NEW.id, OLD.manager_id, 5, 'signed_away')
    ON CONFLICT (battler_id, ex_manager_id)
    DO UPDATE SET
      intensity = LEAST(manager_grudges.intensity + 2, 10),
      faded_at = NULL; -- Reactivate if it had faded
  END IF;

  -- If manager is being set (new or changed)
  IF NEW.manager_id IS NOT NULL AND (OLD.manager_id IS NULL OR OLD.manager_id != NEW.manager_id) THEN
    -- Start new management relationship
    INSERT INTO manager_history (battler_id, manager_id)
    VALUES (NEW.id, NEW.manager_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on battler manager changes
DROP TRIGGER IF EXISTS trigger_manager_change ON battlers;
CREATE TRIGGER trigger_manager_change
  AFTER UPDATE OF manager_id ON battlers
  FOR EACH ROW
  EXECUTE FUNCTION record_manager_change();

-- ========================================
-- FUNCTION: Get Grudge Targets
-- ========================================

-- Returns all battlers that a given battler has a grudge against
-- (battlers managed by their ex-managers)
CREATE OR REPLACE FUNCTION get_grudge_targets(p_battler_id UUID)
RETURNS TABLE (
  target_battler_id UUID,
  target_stage_name TEXT,
  grudge_intensity INTEGER,
  ex_manager_id UUID,
  grudge_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as target_battler_id,
    b.stage_name as target_stage_name,
    mg.intensity as grudge_intensity,
    mg.ex_manager_id,
    mg.reason as grudge_reason
  FROM manager_grudges mg
  JOIN battlers b ON b.manager_id = mg.ex_manager_id
  WHERE mg.battler_id = p_battler_id
    AND mg.faded_at IS NULL
    AND b.id != p_battler_id; -- Don't return self
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FUNCTION: Check for Manager Grudge
-- ========================================

-- Check if battler A has a grudge against battler B's manager
CREATE OR REPLACE FUNCTION has_manager_grudge(
  p_battler_id UUID,
  p_opponent_id UUID
) RETURNS TABLE (
  has_grudge BOOLEAN,
  intensity INTEGER,
  reason TEXT
) AS $$
DECLARE
  opponent_manager UUID;
BEGIN
  -- Get opponent's manager
  SELECT manager_id INTO opponent_manager FROM battlers WHERE id = p_opponent_id;

  IF opponent_manager IS NULL THEN
    RETURN QUERY SELECT false, 0, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if battler has grudge against opponent's manager
  RETURN QUERY
  SELECT
    true,
    mg.intensity,
    mg.reason
  FROM manager_grudges mg
  WHERE mg.battler_id = p_battler_id
    AND mg.ex_manager_id = opponent_manager
    AND mg.faded_at IS NULL
  UNION ALL
  SELECT false, 0, NULL::TEXT
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- RLS POLICIES
-- ========================================

ALTER TABLE manager_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_grudges ENABLE ROW LEVEL SECURITY;

-- Anyone can read manager history
CREATE POLICY "Anyone can read manager history"
  ON manager_history FOR SELECT
  USING (true);

-- Only system can insert/update manager history (via trigger)
CREATE POLICY "System manages manager history"
  ON manager_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- Anyone can read grudges
CREATE POLICY "Anyone can read grudges"
  ON manager_grudges FOR SELECT
  USING (true);

-- System manages grudges
CREATE POLICY "System manages grudges"
  ON manager_grudges FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================================
-- Summary
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║         MANAGER HISTORY SYSTEM ADDED ✅                       ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'New Tables:';
  RAISE NOTICE '  • manager_history - tracks all management relationships';
  RAISE NOTICE '  • manager_grudges - tracks grudges against ex-managers';
  RAISE NOTICE '';
  RAISE NOTICE 'New Functions:';
  RAISE NOTICE '  • record_manager_change() - auto-triggered on manager change';
  RAISE NOTICE '  • get_grudge_targets(battler_id) - get all grudge targets';
  RAISE NOTICE '  • has_manager_grudge(battler, opponent) - check specific grudge';
  RAISE NOTICE '';
  RAISE NOTICE 'When a battler changes managers:';
  RAISE NOTICE '  1. Old relationship recorded with end_reason';
  RAISE NOTICE '  2. Grudge created against ex-manager';
  RAISE NOTICE '  3. All ex-manager roster become grudge targets';
  RAISE NOTICE '';
END $$;
