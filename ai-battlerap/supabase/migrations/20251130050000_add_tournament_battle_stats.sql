-- ============================================================================
-- Add Tournament Battle Stats Tracking
-- Adds battles_won and battles_lost to tournament_participants for quick stats
-- ============================================================================

-- Add columns to tournament_participants
ALTER TABLE tournament_participants
ADD COLUMN IF NOT EXISTS battles_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS battles_lost INTEGER DEFAULT 0;

COMMENT ON COLUMN tournament_participants.battles_won IS 'Number of battles won in this tournament';
COMMENT ON COLUMN tournament_participants.battles_lost IS 'Number of battles lost in this tournament';

-- Create function to update tournament battle stats
CREATE OR REPLACE FUNCTION update_tournament_battle_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_winner_id UUID;
  v_loser_id UUID;
  v_tournament_id UUID;
BEGIN
  -- Only process completed brackets
  IF NEW.status = 'completed' AND NEW.winner_battler_id IS NOT NULL THEN
    v_winner_id := NEW.winner_battler_id;
    v_loser_id := NEW.loser_battler_id;
    v_tournament_id := NEW.tournament_id;

    -- Increment wins for winner
    UPDATE tournament_participants
    SET battles_won = battles_won + 1
    WHERE tournament_id = v_tournament_id
      AND battler_id = v_winner_id;

    -- Increment losses for loser
    UPDATE tournament_participants
    SET battles_lost = battles_lost + 1
    WHERE tournament_id = v_tournament_id
      AND battler_id = v_loser_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stats when bracket completes
DROP TRIGGER IF EXISTS trigger_update_tournament_battle_stats ON tournament_brackets;
CREATE TRIGGER trigger_update_tournament_battle_stats
  AFTER UPDATE ON tournament_brackets
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_tournament_battle_stats();

COMMENT ON FUNCTION update_tournament_battle_stats IS 'Updates tournament participant battle stats when bracket completes';

-- Backfill existing data
DO $$
DECLARE
  v_participant RECORD;
  v_wins INTEGER;
  v_losses INTEGER;
BEGIN
  FOR v_participant IN
    SELECT DISTINCT tournament_id, battler_id
    FROM tournament_participants
  LOOP
    -- Count wins
    SELECT COUNT(*) INTO v_wins
    FROM tournament_brackets
    WHERE tournament_id = v_participant.tournament_id
      AND winner_battler_id = v_participant.battler_id
      AND status = 'completed';

    -- Count losses
    SELECT COUNT(*) INTO v_losses
    FROM tournament_brackets
    WHERE tournament_id = v_participant.tournament_id
      AND loser_battler_id = v_participant.battler_id
      AND status = 'completed';

    -- Update participant
    UPDATE tournament_participants
    SET battles_won = v_wins,
        battles_lost = v_losses
    WHERE tournament_id = v_participant.tournament_id
      AND battler_id = v_participant.battler_id;
  END LOOP;

  RAISE NOTICE 'Backfilled tournament battle stats for existing participants';
END $$;
