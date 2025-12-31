/**
 * Atomic Counter Operations Migration
 *
 * CRITICAL DATA INTEGRITY FIX (C7):
 * - Current code: Two-step counter delete (delete counter → update segment)
 * - Problem: If segment update fails, counter deleted but segment orphaned as is_counter=true
 * - Solution: Single atomic function with transaction
 */

/**
 * Atomic Counter Delete Function
 *
 * Deletes a counter AND updates the associated segment atomically:
 * 1. Deletes the counter record
 * 2. Unmarks the segment as a counter
 *
 * If either operation fails, both rollback automatically.
 */
CREATE OR REPLACE FUNCTION delete_prep_counter(
  p_counter_id UUID,
  p_battle_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_segment_id UUID;
BEGIN
  -- Delete counter and get segment_id atomically
  DELETE FROM prep_counters
  WHERE id = p_counter_id AND battle_id = p_battle_id
  RETURNING segment_id INTO v_segment_id;

  -- Check if counter was found and deleted
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Counter not found: %', p_counter_id;
  END IF;

  -- Unmark segment as counter if it exists
  IF v_segment_id IS NOT NULL THEN
    UPDATE prep_segments
    SET
      is_counter = false,
      counter_target = NULL,
      updated_at = NOW()
    WHERE id = v_segment_id;
  END IF;

  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    -- Any error triggers automatic rollback of BOTH operations
    RAISE EXCEPTION 'Failed to delete counter: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION delete_prep_counter IS
  'Atomically deletes counter and updates segment. Both succeed or both rollback.';
