-- ============================================================================
-- Seed Initial Tournament for Phase 1
-- Small Room Circuit Championship - 16 battler tournament
-- ============================================================================

-- Insert initial tournament
INSERT INTO tournaments (
  name,
  description,
  league_id,
  max_participants,
  tier_restriction,
  total_prize_pool,
  status,
  registration_opens_at,
  registration_closes_at,
  tournament_starts_at,
  rules_text
)
SELECT
  'Small Room Circuit Championship',
  'First ever 16-battler tournament for low and mid-tier battlers. Prove yourself on the big stage! Single elimination bracket. Winner takes 50% of $25,000 prize pool.',
  id,
  16,
  'low_mid',
  25000.00,
  'registration',
  timezone('utc'::text, now()),
  timezone('utc'::text, now()) + interval '7 days',
  timezone('utc'::text, now()) + interval '14 days',
  'Standard 3-round format. All rounds judged. No time limit on prep. Tournament battles do not pay per-battle fees - only prize pool distribution.'
FROM leagues
WHERE name = 'Small Room Circuit'
LIMIT 1;

-- Verify insertion
DO $$
DECLARE
  v_tournament_id UUID;
  v_tournament_name TEXT;
BEGIN
  SELECT id, name INTO v_tournament_id, v_tournament_name
  FROM tournaments
  WHERE name = 'Small Room Circuit Championship'
  LIMIT 1;

  IF v_tournament_id IS NOT NULL THEN
    RAISE NOTICE 'Tournament created successfully: % (ID: %)', v_tournament_name, v_tournament_id;
  ELSE
    RAISE EXCEPTION 'Failed to create tournament';
  END IF;
END $$;
