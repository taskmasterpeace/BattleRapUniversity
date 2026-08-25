-- ONE WALLET. Battle income was credited to battler_attributes.balance /
-- lifetime_earnings (via add_earnings_transaction) while every spending path
-- (travel, crew recruiting) and every UI surface reads battlers.current_balance /
-- total_career_earnings. Result: players could never spend a dollar they earned
-- on stage, and "Lifetime Earnings" showed $0 forever.
--
-- 1) Credit all historical battle income into the spendable wallet.
-- 2) Point the RPC at the battlers columns so the ledgers never split again.

-- 1. Reconcile: move earned-but-never-credited income into battlers
UPDATE battlers b
SET current_balance = COALESCE(b.current_balance, 0) + COALESCE(ba.lifetime_earnings, 0),
    total_career_earnings = COALESCE(b.total_career_earnings, 0) + COALESCE(ba.lifetime_earnings, 0)
FROM battler_attributes ba
WHERE ba.battler_id = b.id
  AND COALESCE(ba.lifetime_earnings, 0) > 0;

-- Zero the orphan ledger so a re-run can't double-credit
UPDATE battler_attributes
SET balance = 0,
    lifetime_earnings = 0
WHERE COALESCE(lifetime_earnings, 0) > 0 OR COALESCE(balance, 0) <> 0;

-- 2. RPC now writes the real wallet
CREATE OR REPLACE FUNCTION public.add_earnings_transaction(
  p_battler_id uuid,
  p_amount numeric,
  p_transaction_type text,
  p_battle_id uuid DEFAULT NULL::uuid,
  p_description text DEFAULT NULL::text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $function$
DECLARE
  v_transaction_id UUID;
BEGIN
  INSERT INTO battler_earnings (
    battler_id, battle_id, amount, transaction_type, description, metadata
  ) VALUES (
    p_battler_id, p_battle_id, p_amount, p_transaction_type, p_description, p_metadata
  ) RETURNING id INTO v_transaction_id;

  UPDATE battlers
  SET current_balance = COALESCE(current_balance, 0) + p_amount,
      total_career_earnings = COALESCE(total_career_earnings, 0)
        + CASE WHEN p_amount > 0 THEN p_amount ELSE 0 END
  WHERE id = p_battler_id;

  RETURN v_transaction_id;
END;
$function$;
