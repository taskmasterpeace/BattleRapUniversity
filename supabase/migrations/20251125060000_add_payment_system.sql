-- ============================================================================
-- Payment & Earnings System
-- Battlers get paid for battles based on tier and performance
-- ============================================================================

-- ==========================================================================
-- Add payment columns to battles table
-- ==========================================================================
ALTER TABLE battles
ADD COLUMN IF NOT EXISTS player_payout DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_payout DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_tournament_battle BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tournament_id UUID;

COMMENT ON COLUMN battles.player_payout IS 'Amount paid to player battler for this battle';
COMMENT ON COLUMN battles.ai_payout IS 'Amount paid to AI battler for this battle';
COMMENT ON COLUMN battles.is_tournament_battle IS 'TRUE if this is part of a tournament';
COMMENT ON COLUMN battles.tournament_id IS 'Link to tournament if applicable';

-- ==========================================================================
-- Create battler_earnings table (transaction history)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS battler_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,

  -- Transaction details
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'battle_base_pay',
    'battle_win_bonus',
    'tournament_prize',
    'life_event_gain',
    'life_event_loss'
  )),

  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE battler_earnings IS 'Transaction history for all battler earnings and expenses';
COMMENT ON COLUMN battler_earnings.amount IS 'Amount earned (positive) or spent (negative)';
COMMENT ON COLUMN battler_earnings.transaction_type IS 'Type of transaction';

CREATE INDEX idx_battler_earnings_battler ON battler_earnings(battler_id);
CREATE INDEX idx_battler_earnings_battle ON battler_earnings(battle_id);
CREATE INDEX idx_battler_earnings_created ON battler_earnings(created_at DESC);

-- ==========================================================================
-- Add financial tracking to battler_attributes
-- ==========================================================================
ALTER TABLE battler_attributes
ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 5000.00,
ADD COLUMN IF NOT EXISTS lifetime_earnings DECIMAL(10, 2) DEFAULT 0.00;

COMMENT ON COLUMN battler_attributes.balance IS 'Current cash balance';
COMMENT ON COLUMN battler_attributes.lifetime_earnings IS 'Total all-time earnings';

-- ==========================================================================
-- Helper function: Get battler financial summary
-- ==========================================================================
CREATE OR REPLACE FUNCTION get_battler_finances(p_battler_id UUID)
RETURNS TABLE (
  current_balance DECIMAL,
  lifetime_earnings DECIMAL,
  total_battles INTEGER,
  total_wins INTEGER,
  average_payout DECIMAL,
  recent_earnings JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ba.balance, 0) as current_balance,
    COALESCE(ba.lifetime_earnings, 0) as lifetime_earnings,
    COUNT(DISTINCT b.id)::INTEGER as total_battles,
    COUNT(DISTINCT CASE WHEN b.winner_battler_id = p_battler_id THEN b.id END)::INTEGER as total_wins,
    COALESCE(AVG(be.amount), 0) as average_payout,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'amount', amount,
          'type', transaction_type,
          'description', description,
          'created_at', created_at
        ) ORDER BY created_at DESC
      )
      FROM (
        SELECT * FROM battler_earnings
        WHERE battler_id = p_battler_id
        ORDER BY created_at DESC
        LIMIT 10
      ) recent
    ) as recent_earnings
  FROM battler_attributes ba
  LEFT JOIN battles b ON (b.battler_player_id = p_battler_id OR b.battler_ai_id = p_battler_id)
    AND b.status = 'completed'
  LEFT JOIN battler_earnings be ON be.battler_id = p_battler_id
    AND be.transaction_type IN ('battle_base_pay', 'battle_win_bonus')
  WHERE ba.battler_id = p_battler_id
  GROUP BY ba.battler_attributes;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_battler_finances IS 'Get comprehensive financial summary for a battler';

-- ==========================================================================
-- Helper function: Add earnings transaction
-- ==========================================================================
CREATE OR REPLACE FUNCTION add_earnings_transaction(
  p_battler_id UUID,
  p_amount DECIMAL,
  p_transaction_type TEXT,
  p_battle_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance DECIMAL;
  v_lifetime_earnings DECIMAL;
  v_new_balance DECIMAL;
  v_new_lifetime DECIMAL;
BEGIN
  -- Get current financial state
  SELECT balance, lifetime_earnings INTO v_current_balance, v_lifetime_earnings
  FROM battler_attributes
  WHERE battler_id = p_battler_id;

  v_current_balance := COALESCE(v_current_balance, 0);
  v_lifetime_earnings := COALESCE(v_lifetime_earnings, 0);

  -- Calculate new values
  v_new_balance := v_current_balance + p_amount;

  -- Only add to lifetime earnings if positive (earnings, not expenses)
  IF p_amount > 0 THEN
    v_new_lifetime := v_lifetime_earnings + p_amount;
  ELSE
    v_new_lifetime := v_lifetime_earnings;
  END IF;

  -- Insert transaction record
  INSERT INTO battler_earnings (
    battler_id,
    battle_id,
    amount,
    transaction_type,
    description,
    metadata
  ) VALUES (
    p_battler_id,
    p_battle_id,
    p_amount,
    p_transaction_type,
    p_description,
    p_metadata
  ) RETURNING id INTO v_transaction_id;

  -- Update battler financial attributes
  UPDATE battler_attributes
  SET balance = v_new_balance,
      lifetime_earnings = v_new_lifetime,
      updated_at = NOW()
  WHERE battler_id = p_battler_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_earnings_transaction IS 'Add earnings transaction and update battler balance';

-- ==========================================================================
-- Initialize balance for existing battlers
-- (The DEFAULT values in the ALTER TABLE above handle this automatically)
-- ==========================================================================
