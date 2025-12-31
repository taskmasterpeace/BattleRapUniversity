/**
 * Career Days System - The "Battle Rap Secret"
 *
 * Tracks career experience as days/weeks/years, but this information is HIDDEN
 * by default. Nobody knows how long you've been in the game until:
 * - Media exposes it
 * - An opponent calls you out
 * - A storyline reveals it
 * - You choose to reveal it yourself
 *
 * This creates authentic battle rap moments like:
 * - "You been in this game 2 years and you supposed to beat me?"
 * - "This dude only 9 weeks old trying to battle legends"
 * - Rookies getting exposed or veterans earning respect
 */

-- ============================================================================
-- ADD CAREER DAYS TRACKING TO BATTLERS
-- ============================================================================

ALTER TABLE battlers
  ADD COLUMN IF NOT EXISTS career_days INTEGER DEFAULT 0 CHECK (career_days >= 0),
  ADD COLUMN IF NOT EXISTS career_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS career_revealed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS career_revealed_method TEXT CHECK (
    career_revealed_method IS NULL OR
    career_revealed_method IN ('media', 'opponent', 'storyline', 'self', 'call_out', 'tournament')
  );

COMMENT ON COLUMN battlers.career_days IS 'Total career days of experience. Increments with battles, prep days, events.';
COMMENT ON COLUMN battlers.career_public IS 'If TRUE, career length is publicly visible. FALSE = secret.';
COMMENT ON COLUMN battlers.career_revealed_at IS 'Timestamp when career was exposed/revealed';
COMMENT ON COLUMN battlers.career_revealed_method IS 'How career was revealed: media, opponent call-out, storyline, self-disclosure, tournament entry';

-- Create index for matchmaking by hidden career
CREATE INDEX IF NOT EXISTS idx_battlers_career_days ON battlers(career_days);

-- ============================================================================
-- CAREER DAY HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS career_day_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- What caused the increment
  source TEXT NOT NULL CHECK (source IN (
    'battle_completed',      -- Finished a battle (win or loss)
    'prep_day',              -- Each day of prep
    'life_event',            -- Life event occurred
    'storyline_chapter',     -- Storyline chapter played
    'tournament_match',      -- Tournament battle
    'training',              -- Training session
    'rest_day',              -- Rest/recovery
    'travel',                -- Travel to event
    'media_appearance',      -- Interview, podcast, etc.
    'time_skip'              -- System-initiated time skip
  )),

  days_added INTEGER NOT NULL DEFAULT 1,

  -- Optional context
  related_battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
  related_event_id UUID,
  description TEXT,

  -- Career state after this increment
  career_days_after INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_career_history_battler ON career_day_history(battler_id, created_at DESC);

COMMENT ON TABLE career_day_history IS 'Tracks all career day increments. Used for timeline and progression display.';

-- ============================================================================
-- CAREER TIER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_career_tier(p_career_days INTEGER)
RETURNS TEXT AS $$
BEGIN
  -- Career Tiers based on days (roughly: 7 days = 1 week, 30 = 1 month, 365 = 1 year)
  -- Rookie: 0-90 days (first ~3 months)
  -- Rising: 91-270 days (~3-9 months)
  -- Established: 271-730 days (~9 months - 2 years)
  -- Veteran: 731-1825 days (~2-5 years)
  -- Legend: 1826+ days (5+ years)

  IF p_career_days <= 90 THEN
    RETURN 'rookie';
  ELSIF p_career_days <= 270 THEN
    RETURN 'rising';
  ELSIF p_career_days <= 730 THEN
    RETURN 'established';
  ELSIF p_career_days <= 1825 THEN
    RETURN 'veteran';
  ELSE
    RETURN 'legend';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_career_tier IS 'Returns career tier based on days: rookie (<90), rising (90-270), established (271-730), veteran (731-1825), legend (1826+)';

-- ============================================================================
-- CAREER REVEAL FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION reveal_career(
  p_battler_id UUID,
  p_reveal_method TEXT,
  p_revealed_by UUID DEFAULT NULL
) RETURNS TABLE(
  career_days INTEGER,
  career_tier TEXT,
  career_years NUMERIC,
  career_weeks INTEGER
) AS $$
DECLARE
  v_career_days INTEGER;
BEGIN
  -- Get current career days
  SELECT b.career_days INTO v_career_days
  FROM battlers b
  WHERE b.id = p_battler_id;

  IF v_career_days IS NULL THEN
    RAISE EXCEPTION 'Battler not found: %', p_battler_id;
  END IF;

  -- Update battler to make career public
  UPDATE battlers
  SET
    career_public = true,
    career_revealed_at = now(),
    career_revealed_method = p_reveal_method
  WHERE id = p_battler_id
  AND career_public = false; -- Only if not already public

  -- Create public_knowledge entry for the reveal
  INSERT INTO public_knowledge (
    knowledge_type,
    related_battler_id,
    week_became_public,
    publicity_level,
    title,
    description,
    media_coverage_level
  )
  SELECT
    'secret_revealed',
    p_battler_id,
    COALESCE((SELECT MAX(week_became_public) + 1 FROM public_knowledge), 1),
    'culture_knows',
    CASE
      WHEN v_career_days <= 90 THEN 'Rookie Exposed: Only ' || (v_career_days / 7) || ' Weeks In'
      WHEN v_career_days >= 1826 THEN 'Veteran Status Confirmed: ' || ROUND(v_career_days / 365.0, 1) || ' Years In The Game'
      ELSE 'Career Length Revealed: ' || ROUND(v_career_days / 365.0, 1) || ' Years Experience'
    END,
    CASE
      WHEN p_reveal_method = 'opponent' THEN 'Exposed during a call-out'
      WHEN p_reveal_method = 'media' THEN 'Dug up by battle rap media'
      WHEN p_reveal_method = 'storyline' THEN 'Revealed through life events'
      WHEN p_reveal_method = 'self' THEN 'Self-disclosed'
      WHEN p_reveal_method = 'tournament' THEN 'Required for tournament registration'
      ELSE 'Career experience became public knowledge'
    END,
    CASE
      WHEN v_career_days <= 90 THEN 7  -- Rookie exposure is big news
      WHEN v_career_days >= 1826 THEN 5 -- Veteran status is noteworthy
      ELSE 3 -- Mid-career reveal is modest news
    END
  WHERE NOT EXISTS (
    SELECT 1 FROM public_knowledge pk
    WHERE pk.related_battler_id = p_battler_id
    AND pk.knowledge_type = 'secret_revealed'
    AND pk.title LIKE '%Career%'
  );

  -- Return career info
  RETURN QUERY
  SELECT
    v_career_days,
    get_career_tier(v_career_days),
    ROUND(v_career_days / 365.0, 2),
    v_career_days / 7;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reveal_career IS 'Reveals a battler''s career length, making it public. Creates public_knowledge entry.';

-- ============================================================================
-- CAREER DAY INCREMENT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_career_days(
  p_battler_id UUID,
  p_days INTEGER,
  p_source TEXT,
  p_related_battle_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  -- Update battler career days
  UPDATE battlers
  SET career_days = COALESCE(career_days, 0) + p_days
  WHERE id = p_battler_id
  RETURNING career_days INTO v_new_total;

  -- Log the increment
  INSERT INTO career_day_history (
    battler_id,
    source,
    days_added,
    related_battle_id,
    description,
    career_days_after
  ) VALUES (
    p_battler_id,
    p_source,
    p_days,
    p_related_battle_id,
    p_description,
    v_new_total
  );

  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_career_days IS 'Increments career days and logs to history. Returns new total.';

-- ============================================================================
-- GET CAREER DISPLAY INFO FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_career_display(p_battler_id UUID, p_viewer_is_owner BOOLEAN DEFAULT false)
RETURNS TABLE(
  display_text TEXT,
  is_hidden BOOLEAN,
  tier TEXT,
  exact_days INTEGER,
  years NUMERIC,
  weeks INTEGER
) AS $$
DECLARE
  v_battler RECORD;
BEGIN
  SELECT b.career_days, b.career_public
  INTO v_battler
  FROM battlers b
  WHERE b.id = p_battler_id;

  IF v_battler IS NULL THEN
    RETURN QUERY SELECT '???'::TEXT, true, 'unknown'::TEXT, 0, 0.0::NUMERIC, 0;
    RETURN;
  END IF;

  -- Owner can always see their own career
  IF p_viewer_is_owner OR v_battler.career_public THEN
    RETURN QUERY SELECT
      CASE
        WHEN v_battler.career_days < 7 THEN v_battler.career_days || ' days'
        WHEN v_battler.career_days < 90 THEN (v_battler.career_days / 7) || ' weeks'
        WHEN v_battler.career_days < 365 THEN ROUND(v_battler.career_days / 30.0, 1) || ' months'
        ELSE ROUND(v_battler.career_days / 365.0, 1) || ' years'
      END,
      false,
      get_career_tier(v_battler.career_days),
      v_battler.career_days,
      ROUND(v_battler.career_days / 365.0, 2),
      v_battler.career_days / 7;
  ELSE
    -- Hidden from public view
    RETURN QUERY SELECT '???'::TEXT, true, 'unknown'::TEXT, NULL::INTEGER, NULL::NUMERIC, NULL::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_career_display IS 'Returns career info for display. Shows ??? if hidden and viewer is not owner.';

-- ============================================================================
-- CAREER-BASED MATCHMAKING TIER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_matchmaking_tier(p_career_days INTEGER, p_rating INTEGER)
RETURNS TEXT AS $$
DECLARE
  career_tier TEXT;
  rating_tier TEXT;
BEGIN
  -- Career tier
  career_tier := get_career_tier(p_career_days);

  -- Rating tier
  IF p_rating < 1200 THEN
    rating_tier := 'low';
  ELSIF p_rating < 1500 THEN
    rating_tier := 'mid';
  ELSIF p_rating < 1800 THEN
    rating_tier := 'high';
  ELSE
    rating_tier := 'elite';
  END IF;

  -- Combine for matchmaking (prevents rookies fighting legends even if rating is similar)
  RETURN career_tier || '_' || rating_tier;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_matchmaking_tier IS 'Returns combined career+rating tier for matchmaking. Prevents rookie vs legend matchups.';

-- ============================================================================
-- INITIALIZE EXISTING BATTLERS WITH CAREER DAYS
-- ============================================================================

-- Set career days based on completed battles for existing battlers
UPDATE battlers b
SET career_days = COALESCE(
  (
    SELECT COUNT(*) * 14 -- ~2 weeks per battle (announcement + prep + battle)
    FROM battles bt
    WHERE (bt.battler_player_id = b.id OR bt.battler_ai_id = b.id)
    AND bt.status = 'completed'
  ),
  0
);

-- AI battlers should have established careers (they're known names)
UPDATE battlers
SET career_days = CASE
  WHEN tier = 'god' THEN 2190    -- 6 years
  WHEN tier = 'top' THEN 1095    -- 3 years
  WHEN tier = 'mid' THEN 548     -- 1.5 years
  ELSE 180                        -- 6 months
END
WHERE is_ai = true;

-- AI battlers' careers are public (they're established names)
UPDATE battlers
SET
  career_public = true,
  career_revealed_method = 'self'
WHERE is_ai = true;

-- Player battlers start with hidden career
UPDATE battlers
SET career_public = false
WHERE is_ai = false AND career_public IS NULL;
