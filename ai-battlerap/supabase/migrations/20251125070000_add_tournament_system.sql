-- ============================================================================
-- Tournament System
-- Single elimination brackets for low/mid tier battlers
-- Based on real battle rap tournaments like Ultimate Madness
-- ============================================================================

-- ==========================================================================
-- Tournaments table
-- ==========================================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,

  -- Tournament configuration
  max_participants INTEGER NOT NULL DEFAULT 16,
  tier_restriction TEXT NOT NULL CHECK (tier_restriction IN ('low', 'mid', 'low_mid', 'all')),
  tournament_format TEXT NOT NULL DEFAULT 'single_elimination' CHECK (tournament_format IN ('single_elimination')),

  -- Prize pool
  total_prize_pool DECIMAL(10, 2) NOT NULL,
  prize_distribution JSONB NOT NULL DEFAULT '{
    "winner": 0.50,
    "runner_up": 0.25,
    "semifinalists": 0.10,
    "quarterfinalists": 0.03
  }'::jsonb,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'registration' CHECK (status IN (
    'registration',    -- Open for sign-ups
    'seeding',        -- Determining brackets
    'in_progress',    -- Tournament running
    'completed',      -- Tournament finished
    'cancelled'       -- Tournament cancelled
  )),

  -- Tournament schedule
  registration_opens_at TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_closes_at TIMESTAMP WITH TIME ZONE NOT NULL,
  tournament_starts_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Current round tracking
  current_round TEXT CHECK (current_round IN ('first_round', 'quarterfinals', 'semifinals', 'finals')),
  current_round_deadline TIMESTAMP WITH TIME ZONE,

  -- Winner tracking
  winner_battler_id UUID REFERENCES battlers(id) ON DELETE SET NULL,
  runner_up_battler_id UUID REFERENCES battlers(id) ON DELETE SET NULL,

  -- Metadata
  rules_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE tournaments IS 'Tournament events with brackets and prize pools';
COMMENT ON COLUMN tournaments.tier_restriction IS 'Which tiers can participate (low/mid/low_mid/all)';
COMMENT ON COLUMN tournaments.prize_distribution IS 'Percentage breakdown of prize pool';
COMMENT ON COLUMN tournaments.current_round IS 'Current active round of tournament';

CREATE INDEX idx_tournaments_league ON tournaments(league_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_starts_at ON tournaments(tournament_starts_at);

-- ==========================================================================
-- Tournament participants table
-- ==========================================================================
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Registration
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  registration_order INTEGER, -- Order of registration (for tiebreakers)

  -- Seeding
  seed_number INTEGER, -- 1-16 for bracket position
  rating_at_registration DECIMAL(8, 2), -- ELO rating when registered

  -- Placement tracking
  final_placement TEXT CHECK (final_placement IN (
    'winner',
    'runner_up',
    'semifinalist',
    'quarterfinalist',
    'first_round',
    'withdrawn'
  )),
  eliminated_in_round TEXT CHECK (eliminated_in_round IN ('first_round', 'quarterfinals', 'semifinals', 'finals')),

  -- Prizes
  prize_amount DECIMAL(10, 2) DEFAULT 0,
  prize_paid BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  withdrawal_reason TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(tournament_id, battler_id)
);

COMMENT ON TABLE tournament_participants IS 'Battlers registered for tournaments';
COMMENT ON COLUMN tournament_participants.seed_number IS 'Bracket position (1-16)';
COMMENT ON COLUMN tournament_participants.final_placement IS 'Where battler finished in tournament';

CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_battler ON tournament_participants(battler_id);
CREATE INDEX idx_tournament_participants_seed ON tournament_participants(tournament_id, seed_number);

-- ==========================================================================
-- Tournament brackets table (matchups)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS tournament_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,

  -- Round tracking
  round TEXT NOT NULL CHECK (round IN ('first_round', 'quarterfinals', 'semifinals', 'finals')),
  match_number INTEGER NOT NULL, -- 1-8 for first round, 1-4 for quarters, etc.

  -- Participants
  battler_1_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  battler_2_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  seed_1 INTEGER,
  seed_2 INTEGER,

  -- Battle reference
  battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,

  -- Results
  winner_battler_id UUID REFERENCES battlers(id) ON DELETE SET NULL,
  loser_battler_id UUID REFERENCES battlers(id) ON DELETE SET NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Not yet scheduled
    'scheduled',    -- Battle scheduled
    'locked',       -- Battle locked (prep deadline passed)
    'completed',    -- Battle finished
    'walkover'      -- One battler withdrew/no-show
  )),

  -- Schedule
  scheduled_at TIMESTAMP WITH TIME ZONE,
  prep_deadline TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(tournament_id, round, match_number)
);

COMMENT ON TABLE tournament_brackets IS 'Individual tournament matchups and results';
COMMENT ON COLUMN tournament_brackets.match_number IS 'Match position within round';
COMMENT ON COLUMN tournament_brackets.status IS 'Current state of this matchup';

CREATE INDEX idx_tournament_brackets_tournament ON tournament_brackets(tournament_id);
CREATE INDEX idx_tournament_brackets_round ON tournament_brackets(tournament_id, round);
CREATE INDEX idx_tournament_brackets_battle ON tournament_brackets(battle_id);
CREATE INDEX idx_tournament_brackets_status ON tournament_brackets(status);

-- ==========================================================================
-- Tournament achievements table
-- ==========================================================================
CREATE TABLE IF NOT EXISTS tournament_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,

  -- Achievement details
  achievement_type TEXT NOT NULL CHECK (achievement_type IN (
    'tournament_winner',
    'tournament_runner_up',
    'tournament_semifinalist',
    'tournament_upset',        -- Beat higher seed by 3+ positions
    'tournament_perfect_run',  -- Won all matches 3-0
    'tournament_comeback',     -- Won finals after losing round 1
    'tournament_cinderella'    -- Low seed (#13-16) reached finals
  )),

  -- Context
  achievement_name TEXT NOT NULL,
  description TEXT,

  -- Stats
  final_placement TEXT,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  biggest_upset_seed_diff INTEGER, -- Beat #5 seed as #16 = 11 diff

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(battler_id, tournament_id, achievement_type)
);

COMMENT ON TABLE tournament_achievements IS 'Permanent tournament achievements for battler careers';
COMMENT ON COLUMN tournament_achievements.achievement_type IS 'Type of tournament achievement earned';
COMMENT ON COLUMN tournament_achievements.biggest_upset_seed_diff IS 'Largest seed difference overcome';

CREATE INDEX idx_tournament_achievements_battler ON tournament_achievements(battler_id);
CREATE INDEX idx_tournament_achievements_tournament ON tournament_achievements(tournament_id);
CREATE INDEX idx_tournament_achievements_type ON tournament_achievements(achievement_type);

-- ==========================================================================
-- Helper function: Get tournament standings
-- ==========================================================================
CREATE OR REPLACE FUNCTION get_tournament_standings(p_tournament_id UUID)
RETURNS TABLE (
  battler_id UUID,
  battler_name TEXT,
  seed_number INTEGER,
  rating DECIMAL,
  wins INTEGER,
  losses INTEGER,
  final_placement TEXT,
  prize_amount DECIMAL,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tp.battler_id,
    b.stage_name as battler_name,
    tp.seed_number,
    r.rating,
    COUNT(CASE WHEN tb.winner_battler_id = tp.battler_id THEN 1 END)::INTEGER as wins,
    COUNT(CASE WHEN tb.loser_battler_id = tp.battler_id THEN 1 END)::INTEGER as losses,
    tp.final_placement,
    tp.prize_amount,
    tp.is_active
  FROM tournament_participants tp
  JOIN battlers b ON b.id = tp.battler_id
  LEFT JOIN rankings r ON r.battler_id = tp.battler_id
  LEFT JOIN tournament_brackets tb ON tb.tournament_id = tp.tournament_id
    AND (tb.battler_1_id = tp.battler_id OR tb.battler_2_id = tp.battler_id)
    AND tb.status = 'completed'
  WHERE tp.tournament_id = p_tournament_id
  GROUP BY tp.battler_id, b.stage_name, tp.seed_number, r.rating, tp.final_placement, tp.prize_amount, tp.is_active
  ORDER BY tp.seed_number ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_tournament_standings IS 'Get current standings and stats for tournament';

-- ==========================================================================
-- Helper function: Calculate and distribute tournament prizes
-- ==========================================================================
CREATE OR REPLACE FUNCTION distribute_tournament_prizes(p_tournament_id UUID)
RETURNS TABLE (
  battler_id UUID,
  prize_amount DECIMAL,
  placement TEXT
) AS $$
DECLARE
  v_total_prize DECIMAL;
  v_prize_dist JSONB;
  v_winner_id UUID;
  v_runner_up_id UUID;
  v_winner_prize DECIMAL;
  v_runner_up_prize DECIMAL;
  v_semi_prize DECIMAL;
  v_quarter_prize DECIMAL;
BEGIN
  -- Get tournament prize pool and distribution
  SELECT total_prize_pool, prize_distribution, winner_battler_id, runner_up_battler_id
  INTO v_total_prize, v_prize_dist, v_winner_id, v_runner_up_id
  FROM tournaments
  WHERE id = p_tournament_id;

  IF v_total_prize IS NULL THEN
    RAISE EXCEPTION 'Tournament not found: %', p_tournament_id;
  END IF;

  -- Calculate prize amounts
  v_winner_prize := v_total_prize * (v_prize_dist->>'winner')::DECIMAL;
  v_runner_up_prize := v_total_prize * (v_prize_dist->>'runner_up')::DECIMAL;
  v_semi_prize := v_total_prize * (v_prize_dist->>'semifinalists')::DECIMAL;
  v_quarter_prize := v_total_prize * (v_prize_dist->>'quarterfinalists')::DECIMAL;

  -- Update winner
  IF v_winner_id IS NOT NULL THEN
    UPDATE tournament_participants
    SET prize_amount = v_winner_prize,
        final_placement = 'winner'
    WHERE tournament_id = p_tournament_id AND battler_id = v_winner_id;

    -- Add earnings transaction
    PERFORM add_earnings_transaction(
      v_winner_id,
      v_winner_prize,
      'tournament_prize',
      NULL,
      'Tournament Winner Prize',
      jsonb_build_object('tournament_id', p_tournament_id, 'placement', 'winner')
    );
  END IF;

  -- Update runner-up
  IF v_runner_up_id IS NOT NULL THEN
    UPDATE tournament_participants
    SET prize_amount = v_runner_up_prize,
        final_placement = 'runner_up'
    WHERE tournament_id = p_tournament_id AND battler_id = v_runner_up_id;

    -- Add earnings transaction
    PERFORM add_earnings_transaction(
      v_runner_up_id,
      v_runner_up_prize,
      'tournament_prize',
      NULL,
      'Tournament Runner-Up Prize',
      jsonb_build_object('tournament_id', p_tournament_id, 'placement', 'runner_up')
    );
  END IF;

  -- Update semifinalists (losers in semifinals)
  UPDATE tournament_participants tp
  SET prize_amount = v_semi_prize,
      final_placement = 'semifinalist'
  FROM tournament_brackets tb
  WHERE tp.tournament_id = p_tournament_id
    AND tb.tournament_id = p_tournament_id
    AND tb.round = 'semifinals'
    AND tb.loser_battler_id = tp.battler_id;

  -- Add earnings for semifinalists
  INSERT INTO battler_earnings (battler_id, amount, transaction_type, description, metadata)
  SELECT
    tb.loser_battler_id,
    v_semi_prize,
    'tournament_prize',
    'Tournament Semifinalist Prize',
    jsonb_build_object('tournament_id', p_tournament_id, 'placement', 'semifinalist')
  FROM tournament_brackets tb
  WHERE tb.tournament_id = p_tournament_id
    AND tb.round = 'semifinals'
    AND tb.loser_battler_id IS NOT NULL;

  -- Update quarterfinalists (losers in quarterfinals)
  UPDATE tournament_participants tp
  SET prize_amount = v_quarter_prize,
      final_placement = 'quarterfinalist'
  FROM tournament_brackets tb
  WHERE tp.tournament_id = p_tournament_id
    AND tb.tournament_id = p_tournament_id
    AND tb.round = 'quarterfinals'
    AND tb.loser_battler_id = tp.battler_id;

  -- Add earnings for quarterfinalists
  INSERT INTO battler_earnings (battler_id, amount, transaction_type, description, metadata)
  SELECT
    tb.loser_battler_id,
    v_quarter_prize,
    'tournament_prize',
    'Tournament Quarterfinalist Prize',
    jsonb_build_object('tournament_id', p_tournament_id, 'placement', 'quarterfinalist')
  FROM tournament_brackets tb
  WHERE tb.tournament_id = p_tournament_id
    AND tb.round = 'quarterfinals'
    AND tb.loser_battler_id IS NOT NULL;

  -- Return summary
  RETURN QUERY
  SELECT
    tp.battler_id,
    tp.prize_amount,
    tp.final_placement
  FROM tournament_participants tp
  WHERE tp.tournament_id = p_tournament_id
    AND tp.prize_amount > 0
  ORDER BY tp.prize_amount DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION distribute_tournament_prizes IS 'Calculate and award tournament prizes to participants';

-- ==========================================================================
-- Update battles table for tournament support
-- ==========================================================================
-- Note: tournament_id column was already added in payment system migration
-- Just add index for performance
CREATE INDEX IF NOT EXISTS idx_battles_tournament ON battles(tournament_id);

-- Add comment
COMMENT ON COLUMN battles.is_tournament_battle IS 'TRUE if this battle is part of a tournament (no per-battle payout)';

-- ==========================================================================
-- Seed initial tournament (optional - for testing)
-- ==========================================================================
-- This can be uncommented to create a test tournament

-- INSERT INTO tournaments (
--   name,
--   description,
--   league_id,
--   max_participants,
--   tier_restriction,
--   total_prize_pool,
--   status,
--   registration_opens_at,
--   registration_closes_at,
--   tournament_starts_at
-- )
-- SELECT
--   'Small Room Circuit Championship',
--   'First ever 16-battler tournament for low and mid-tier battlers. Prove yourself on the big stage!',
--   id,
--   16,
--   'low_mid',
--   25000.00,
--   'registration',
--   timezone('utc'::text, now()),
--   timezone('utc'::text, now()) + interval '7 days',
--   timezone('utc'::text, now()) + interval '14 days'
-- FROM leagues
-- WHERE name = 'Small Room Circuit'
-- LIMIT 1;
