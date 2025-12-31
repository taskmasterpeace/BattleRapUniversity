-- Event Pacing Limits System
-- Prevents event spam by enforcing:
-- 1. Max 1 pending event per battler
-- 2. Cooldowns on same event triggering multiple times
-- 3. Max 1 event per battle cycle

-- ==========================================
-- 1. ADD COOLDOWN TRACKING
-- ==========================================

-- Add last_triggered_at to track when event last fired
ALTER TABLE life_event_templates
ADD COLUMN IF NOT EXISTS last_triggered_for_battler jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN life_event_templates.last_triggered_for_battler IS
  'Tracks last triggered timestamp per battler ID to enforce cooldowns';

-- ==========================================
-- 2. ADD HELPER FUNCTION FOR PENDING CHECK
-- ==========================================

CREATE OR REPLACE FUNCTION has_pending_life_event(p_battler_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_pending_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_pending_count
  FROM battler_life_events
  WHERE battler_id = p_battler_id
    AND status = 'pending';

  RETURN v_pending_count > 0;
END;
$$;

COMMENT ON FUNCTION has_pending_life_event IS
  'Check if battler has any pending life events (max 1 at a time)';

-- ==========================================
-- 3. ADD COOLDOWN CHECK FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION is_event_on_cooldown(
  p_template_code text,
  p_battler_id uuid,
  p_cooldown_battles integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_last_triggered_at timestamptz;
  v_battles_since integer;
BEGIN
  -- Get last triggered timestamp for this battler
  SELECT (last_triggered_for_battler->>p_battler_id::text)::timestamptz
  INTO v_last_triggered_at
  FROM life_event_templates
  WHERE code = p_template_code;

  -- If never triggered, not on cooldown
  IF v_last_triggered_at IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Count battles since last triggered
  SELECT COUNT(*)
  INTO v_battles_since
  FROM battles
  WHERE battler_player_id = p_battler_id
    AND status = 'completed'
    AND scheduled_at > v_last_triggered_at;

  -- On cooldown if not enough battles have passed
  RETURN v_battles_since < p_cooldown_battles;
END;
$$;

COMMENT ON FUNCTION is_event_on_cooldown IS
  'Check if event is on cooldown for this battler (default 5 battles)';

-- ==========================================
-- 4. ADD FUNCTION TO RECORD EVENT TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION record_event_trigger(
  p_template_code text,
  p_battler_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE life_event_templates
  SET last_triggered_for_battler =
    COALESCE(last_triggered_for_battler, '{}'::jsonb) ||
    jsonb_build_object(p_battler_id::text, now()::text)
  WHERE code = p_template_code;
END;
$$;

COMMENT ON FUNCTION record_event_trigger IS
  'Record that event triggered for battler at current time';

-- ==========================================
-- 5. ADD CONSTRAINT FOR MAX PENDING EVENTS
-- ==========================================

-- This will be enforced in application logic, but add a partial index
-- to make the query faster

CREATE INDEX IF NOT EXISTS idx_battler_life_events_pending_per_battler
  ON battler_life_events(battler_id)
  WHERE status = 'pending';

-- ==========================================
-- 6. ADD HELPER VIEW FOR EVENT ELIGIBILITY
-- ==========================================

CREATE OR REPLACE VIEW event_eligibility AS
SELECT
  t.code AS template_code,
  t.title,
  t.trigger_type,
  t.trigger_probability,
  b.id AS battler_id,
  b.stage_name,
  -- Check if battler has pending event
  EXISTS(
    SELECT 1
    FROM battler_life_events ble
    WHERE ble.battler_id = b.id
      AND ble.status = 'pending'
  ) AS has_pending_event,
  -- Check battles since last trigger (for cooldown)
  (
    SELECT COUNT(*)
    FROM battles bat
    WHERE bat.battler_player_id = b.id
      AND bat.status = 'completed'
      AND bat.scheduled_at > COALESCE(
        (t.last_triggered_for_battler->>b.id::text)::timestamptz,
        '1970-01-01'::timestamptz
      )
  ) AS battles_since_last_trigger
FROM life_event_templates t
CROSS JOIN battlers b
WHERE b.is_ai = FALSE;

COMMENT ON VIEW event_eligibility IS
  'Shows which events are eligible for which battlers based on pacing rules';

-- ==========================================
-- 7. ADD HELPER FUNCTION FOR SAFE TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION can_trigger_event(
  p_template_code text,
  p_battler_id uuid,
  p_cooldown_battles integer DEFAULT 5
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check 1: No pending events
  IF has_pending_life_event(p_battler_id) THEN
    RETURN FALSE;
  END IF;

  -- Check 2: Not on cooldown
  IF is_event_on_cooldown(p_template_code, p_battler_id, p_cooldown_battles) THEN
    RETURN FALSE;
  END IF;

  -- All checks passed
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION can_trigger_event IS
  'Comprehensive check if event can trigger for battler (no pending, not on cooldown)';

-- ==========================================
-- 8. EXAMPLE USAGE DOCUMENTATION
-- ==========================================

COMMENT ON TABLE life_event_templates IS
  'Life event templates with pacing controls.

  USAGE:

  -- Check if event can trigger
  SELECT can_trigger_event(''viral_haymaker'', battler_id)

  -- Create event and record trigger
  INSERT INTO battler_life_events (...)
  SELECT record_event_trigger(''viral_haymaker'', battler_id)

  -- View all eligible events for a battler
  SELECT * FROM event_eligibility
  WHERE battler_id = ''..'' AND NOT has_pending_event
    AND battles_since_last_trigger >= 5
  ';
