/**
 * Fan and Views System
 *
 * Tracks battler fan bases, battle view counts, league audiences, and view history.
 * Based on real battle rap data from versetracker.com:
 * - LOW tier: 1K-20K views (avg: 12,925 - Tru Foe)
 * - MID tier: 50K-200K views (avg: 129,565 - Loso)
 * - TOP tier: 300K-800K views (avg: 577,539 - T-Top)
 * - GOAT tier: 600K+ views (avg: 1,247,059 - Charlie Clips)
 */

-- ============================================================================
-- BATTLER FANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS battler_fans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Battler reference
  battler_id UUID NOT NULL UNIQUE REFERENCES battlers(id) ON DELETE CASCADE,

  -- Fan base composition
  total_fans INTEGER NOT NULL DEFAULT 0 CHECK (total_fans >= 0),
  hardcore_fans INTEGER NOT NULL DEFAULT 0 CHECK (hardcore_fans >= 0),
  casual_fans INTEGER NOT NULL DEFAULT 0 CHECK (casual_fans >= 0),

  -- Growth metrics
  fan_growth_rate NUMERIC NOT NULL DEFAULT 0.0, -- % change per battle
  trending_score NUMERIC NOT NULL DEFAULT 0.0,  -- 0-100 viral momentum score

  -- Engagement metrics
  avg_hype_multiplier NUMERIC NOT NULL DEFAULT 0.5, -- How excited casual fans are (0.2-1.0)
  hardcore_retention NUMERIC NOT NULL DEFAULT 0.98, -- % of hardcore fans who stay loyal

  -- Constraints
  CONSTRAINT hardcore_less_than_total CHECK (hardcore_fans <= total_fans),
  CONSTRAINT casual_less_than_total CHECK (casual_fans <= total_fans),
  CONSTRAINT fan_segments_sum CHECK (hardcore_fans + casual_fans = total_fans)
);

CREATE INDEX IF NOT EXISTS idx_battler_fans_battler ON battler_fans(battler_id);
CREATE INDEX IF NOT EXISTS idx_battler_fans_total ON battler_fans(total_fans DESC);
CREATE INDEX IF NOT EXISTS idx_battler_fans_trending ON battler_fans(trending_score DESC);

COMMENT ON TABLE battler_fans IS 'Tracks battler fan bases with hardcore/casual segmentation';
COMMENT ON COLUMN battler_fans.hardcore_fans IS 'Fans who watch every battle (100% view conversion)';
COMMENT ON COLUMN battler_fans.casual_fans IS 'Fans who watch based on hype (variable conversion)';
COMMENT ON COLUMN battler_fans.trending_score IS 'Viral momentum score (0-100) - affects casual fan hype';
COMMENT ON COLUMN battler_fans.avg_hype_multiplier IS 'Average casual fan view conversion rate (0.2-1.0)';

-- ============================================================================
-- BATTLE VIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS battle_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Battle reference
  battle_id UUID NOT NULL UNIQUE REFERENCES battles(id) ON DELETE CASCADE,

  -- Total views
  total_views INTEGER NOT NULL DEFAULT 0 CHECK (total_views >= 0),

  -- View source breakdown
  from_fan_base INTEGER NOT NULL DEFAULT 0,           -- Player's hardcore/casual fans
  from_league_subscribers INTEGER NOT NULL DEFAULT 0, -- League's subscriber base
  from_opponent_fans INTEGER NOT NULL DEFAULT 0,      -- Opponent's fans tuning in
  from_viral_discovery INTEGER NOT NULL DEFAULT 0,    -- New viewers from viral moments
  from_scandal_boost INTEGER NOT NULL DEFAULT 0,      -- Drama/controversy boost

  -- Performance multipliers applied
  viral_multiplier NUMERIC NOT NULL DEFAULT 1.0,      -- 1.0-10.0 based on viral triggers
  scandal_multiplier NUMERIC NOT NULL DEFAULT 1.0,    -- 1.0-3.0 based on drama level
  quality_multiplier NUMERIC NOT NULL DEFAULT 1.0,    -- 0.5-2.0 based on performance

  -- Engagement metrics
  avg_watch_percentage NUMERIC DEFAULT 75.0,          -- % of battle watched on average
  shares INTEGER DEFAULT 0,                           -- Social media shares
  comments INTEGER DEFAULT 0,                         -- Community engagement

  -- View tier classification
  view_tier TEXT NOT NULL DEFAULT 'low' CHECK (view_tier IN ('low', 'mid', 'top', 'goat')),

  -- Constraints
  CONSTRAINT view_sources_sum CHECK (
    from_fan_base + from_league_subscribers + from_opponent_fans +
    from_viral_discovery + from_scandal_boost <= total_views
  )
);

CREATE INDEX IF NOT EXISTS idx_battle_views_battle ON battle_views(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_views_total ON battle_views(total_views DESC);
CREATE INDEX IF NOT EXISTS idx_battle_views_tier ON battle_views(view_tier);
CREATE INDEX IF NOT EXISTS idx_battle_views_viral ON battle_views(viral_multiplier DESC);

COMMENT ON TABLE battle_views IS 'Tracks view counts and sources for each battle';
COMMENT ON COLUMN battle_views.from_fan_base IS 'Views from player battler''s existing fan base';
COMMENT ON COLUMN battle_views.from_league_subscribers IS 'Views from league''s subscriber base';
COMMENT ON COLUMN battle_views.from_viral_discovery IS 'Views from viral moments (clips, memes, upsets)';
COMMENT ON COLUMN battle_views.view_tier IS 'View tier: low (1K-20K), mid (50K-200K), top (300K-800K), goat (600K+)';

-- ============================================================================
-- LEAGUE AUDIENCE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS league_audience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- League reference
  league_id UUID NOT NULL UNIQUE REFERENCES leagues(id) ON DELETE CASCADE,

  -- Subscriber base
  total_subscribers INTEGER NOT NULL DEFAULT 0 CHECK (total_subscribers >= 0),
  active_subscribers INTEGER NOT NULL DEFAULT 0 CHECK (active_subscribers >= 0),

  -- Average engagement
  avg_views_per_battle INTEGER NOT NULL DEFAULT 0,
  avg_attendance INTEGER NOT NULL DEFAULT 0,          -- In-person crowd size

  -- Growth metrics
  subscriber_growth_rate NUMERIC NOT NULL DEFAULT 0.0,

  -- Demographic breakdown (percentages should sum to ~100)
  young_hype_percentage NUMERIC DEFAULT 25.0 CHECK (young_hype_percentage >= 0 AND young_hype_percentage <= 100),
  old_heads_percentage NUMERIC DEFAULT 25.0 CHECK (old_heads_percentage >= 0 AND old_heads_percentage <= 100),
  mainstream_percentage NUMERIC DEFAULT 25.0 CHECK (mainstream_percentage >= 0 AND mainstream_percentage <= 100),
  purists_percentage NUMERIC DEFAULT 25.0 CHECK (purists_percentage >= 0 AND purists_percentage <= 100),

  -- League reputation
  prestige_score NUMERIC NOT NULL DEFAULT 5.0 CHECK (prestige_score >= 1.0 AND prestige_score <= 10.0),

  CONSTRAINT active_less_than_total CHECK (active_subscribers <= total_subscribers)
);

CREATE INDEX IF NOT EXISTS idx_league_audience_league ON league_audience(league_id);
CREATE INDEX IF NOT EXISTS idx_league_audience_subscribers ON league_audience(total_subscribers DESC);
CREATE INDEX IF NOT EXISTS idx_league_audience_prestige ON league_audience(prestige_score DESC);

COMMENT ON TABLE league_audience IS 'Tracks league subscriber bases and demographic composition';
COMMENT ON COLUMN league_audience.active_subscribers IS 'Subscribers who watch regularly';
COMMENT ON COLUMN league_audience.avg_views_per_battle IS 'Average views per battle on this league';
COMMENT ON COLUMN league_audience.prestige_score IS 'League reputation/prestige (1-10) - affects view multipliers';
COMMENT ON COLUMN league_audience.young_hype_percentage IS 'Percentage of young_hype crowd (love aggression, performance)';
COMMENT ON COLUMN league_audience.old_heads_percentage IS 'Percentage of old_heads crowd (love pen, schemes, wordplay)';

-- ============================================================================
-- BATTLER VIEW HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS battler_view_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Battler reference
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Time period
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'all_time')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Aggregate stats
  total_battles INTEGER NOT NULL DEFAULT 0,
  total_views INTEGER NOT NULL DEFAULT 0,
  avg_views_per_battle INTEGER NOT NULL DEFAULT 0,
  peak_views INTEGER NOT NULL DEFAULT 0,             -- Highest view count in period

  -- Fan growth
  fans_gained INTEGER NOT NULL DEFAULT 0,
  fans_lost INTEGER NOT NULL DEFAULT 0,
  net_fan_change INTEGER NOT NULL DEFAULT 0,

  -- Performance stats
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,

  -- View tier progression
  view_tier TEXT NOT NULL DEFAULT 'low' CHECK (view_tier IN ('low', 'mid', 'top', 'goat')),

  UNIQUE(battler_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_view_history_battler ON battler_view_history(battler_id);
CREATE INDEX IF NOT EXISTS idx_view_history_period ON battler_view_history(period_type, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_view_history_views ON battler_view_history(total_views DESC);

COMMENT ON TABLE battler_view_history IS 'Tracks battler view performance over time periods';
COMMENT ON COLUMN battler_view_history.period_type IS 'Time period granularity (weekly, monthly, all_time)';
COMMENT ON COLUMN battler_view_history.avg_views_per_battle IS 'Average views across battles in this period';
COMMENT ON COLUMN battler_view_history.peak_views IS 'Highest single battle view count in this period';

-- ============================================================================
-- INITIALIZE DEFAULT DATA
-- ============================================================================

-- Initialize league audiences for existing leagues
INSERT INTO league_audience (league_id, total_subscribers, active_subscribers, avg_views_per_battle, avg_attendance, prestige_score, young_hype_percentage, old_heads_percentage, mainstream_percentage, purists_percentage)
SELECT
  id,
  -- Small Room Circuit: smaller audience, higher engagement
  CASE
    WHEN name LIKE '%Small Room%' THEN 15000
    ELSE 50000
  END as total_subscribers,
  CASE
    WHEN name LIKE '%Small Room%' THEN 12000
    ELSE 35000
  END as active_subscribers,
  CASE
    WHEN name LIKE '%Small Room%' THEN 8000
    ELSE 25000
  END as avg_views_per_battle,
  CASE
    WHEN name LIKE '%Small Room%' THEN 75
    ELSE 300
  END as avg_attendance,
  CASE
    WHEN name LIKE '%Small Room%' THEN 6.0
    ELSE 8.0
  END as prestige_score,
  -- Demographics: Small Room = more purists/old_heads, Main Stage = more young_hype/mainstream
  CASE
    WHEN name LIKE '%Small Room%' THEN 15.0
    ELSE 35.0
  END as young_hype_percentage,
  CASE
    WHEN name LIKE '%Small Room%' THEN 35.0
    ELSE 20.0
  END as old_heads_percentage,
  CASE
    WHEN name LIKE '%Small Room%' THEN 20.0
    ELSE 30.0
  END as mainstream_percentage,
  CASE
    WHEN name LIKE '%Small Room%' THEN 30.0
    ELSE 15.0
  END as purists_percentage
FROM leagues
ON CONFLICT (league_id) DO NOTHING;

-- Initialize battler fan bases for existing battlers
WITH fan_totals AS (
  SELECT
    b.id as battler_id,
    -- Base fan count based on rating tier (calculated once)
    CASE
      WHEN r.rating >= 1800 THEN 5000 + FLOOR(RANDOM() * 5000)::INTEGER  -- Top tier: 5K-10K fans
      WHEN r.rating >= 1600 THEN 2000 + FLOOR(RANDOM() * 3000)::INTEGER  -- Mid tier: 2K-5K fans
      WHEN r.rating >= 1400 THEN 500 + FLOOR(RANDOM() * 1500)::INTEGER   -- Low tier: 500-2K fans
      ELSE 100 + FLOOR(RANDOM() * 400)::INTEGER                        -- Newcomer: 100-500 fans
    END as total_fans,
    -- Fan split percentage
    0.2 + RANDOM() * 0.2 as hardcore_pct,  -- 20-40%
    -- Growth rate
    (RANDOM() - 0.5) * 10 as fan_growth_rate,  -- -5% to +5% per battle
    -- Trending score (higher for higher rated battlers)
    CASE
      WHEN r.rating >= 1800 THEN 60 + RANDOM() * 20
      WHEN r.rating >= 1600 THEN 40 + RANDOM() * 20
      ELSE 20 + RANDOM() * 20
    END as trending_score,
    -- Hype multiplier
    0.4 + RANDOM() * 0.4 as avg_hype_multiplier,  -- 0.4-0.8
    -- Hardcore retention
    0.95 + RANDOM() * 0.04 as hardcore_retention  -- 0.95-0.99
  FROM battlers b
  LEFT JOIN rankings r ON r.battler_id = b.id
)
INSERT INTO battler_fans (battler_id, total_fans, hardcore_fans, casual_fans, fan_growth_rate, trending_score, avg_hype_multiplier, hardcore_retention)
SELECT
  battler_id,
  total_fans,
  FLOOR(total_fans * hardcore_pct)::INTEGER as hardcore_fans,
  total_fans - FLOOR(total_fans * hardcore_pct)::INTEGER as casual_fans,  -- Ensure sum equals total
  fan_growth_rate,
  trending_score,
  avg_hype_multiplier,
  hardcore_retention
FROM fan_totals
ON CONFLICT (battler_id) DO NOTHING;
