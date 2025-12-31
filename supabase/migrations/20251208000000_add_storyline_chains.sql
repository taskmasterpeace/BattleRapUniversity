-- Storyline Chains System
-- Multi-event narrative arcs where choices lead to different paths and endings

-- ==========================================
-- 1. STORYLINE TEMPLATES
-- ==========================================

CREATE TABLE IF NOT EXISTS storyline_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,                    -- "FAMILY_DRAMA"
  name TEXT NOT NULL,                           -- "Family Crisis"
  description TEXT,                             -- Opening hook description

  -- Category for theming and filtering
  category TEXT NOT NULL CHECK (category IN (
    'family',      -- Family Crisis, Parent Illness, Sibling Drama
    'legal',       -- Lawsuit, Arrest, Contract Dispute
    'financial',   -- Debt, Bad Investment, Stolen Money
    'rivalry',     -- Blood Feud, Called Out, Beef Escalation
    'health',      -- Injury, Mental Health, Burnout
    'career',      -- Label Deal, Podcast Beef, League Drama
    'street',      -- Fight, Altercation, Jumped, Retaliation
    'crew',        -- Gang Pressure, Crew Beef, Set Trippin'
    'romance'      -- Relationship Drama, Cheating Scandal, Baby Mama
  )),

  -- Length constraints
  min_chapters INTEGER NOT NULL DEFAULT 2,
  max_chapters INTEGER NOT NULL DEFAULT 5,

  -- Trigger configuration (when does this storyline start?)
  trigger_config JSONB NOT NULL DEFAULT '{}',   -- {type, probability, conditions}

  -- All chapters defined in JSON
  chapters JSONB NOT NULL DEFAULT '[]',         -- Array of chapter definitions

  -- All possible endings defined in JSON
  endings JSONB NOT NULL DEFAULT '[]',          -- Array of ending definitions

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_storyline_templates_category
  ON storyline_templates(category);

CREATE INDEX IF NOT EXISTS idx_storyline_templates_active
  ON storyline_templates(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE storyline_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Storyline templates are readable by authenticated users"
  ON storyline_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage storyline templates"
  ON storyline_templates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 2. ACTIVE STORYLINES
-- ==========================================

CREATE TABLE IF NOT EXISTS active_storylines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  template_code TEXT NOT NULL REFERENCES storyline_templates(code),

  -- Current position in storyline
  current_chapter_id TEXT NOT NULL,             -- "family_ch2"
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',      -- Storyline is ongoing
    'completed',   -- Reached an ending
    'abandoned'    -- Player abandoned or expired
  )),

  -- Track the path taken through the storyline
  choices_made JSONB NOT NULL DEFAULT '[]',     -- [{chapter_id, choice_id, timestamp, effects_applied}]

  -- Outcome tracking (set when storyline completes)
  ending_id TEXT,                               -- "family_end_resolved"
  ending_type TEXT CHECK (ending_type IN ('positive', 'negative', 'neutral', 'catastrophic')),

  -- Next chapter scheduling
  next_chapter_available_at TIMESTAMPTZ,        -- When next chapter can trigger
  next_chapter_deadline TIMESTAMPTZ,            -- When choice auto-resolves

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,

  -- Additional metadata
  total_prep_days_lost INTEGER NOT NULL DEFAULT 0,
  narrative_summary TEXT                         -- LLM-generated summary of choices made
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_active_storylines_battler
  ON active_storylines(battler_id, status);

CREATE INDEX IF NOT EXISTS idx_active_storylines_status
  ON active_storylines(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_active_storylines_template
  ON active_storylines(template_code);

CREATE INDEX IF NOT EXISTS idx_active_storylines_next_available
  ON active_storylines(next_chapter_available_at)
  WHERE status = 'active' AND next_chapter_available_at IS NOT NULL;

-- RLS
ALTER TABLE active_storylines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Battlers can view their own storylines"
  ON active_storylines FOR SELECT
  TO authenticated
  USING (
    battler_id IN (
      SELECT id FROM battlers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage active storylines"
  ON active_storylines FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 3. EXTEND BATTLER LIFE EVENTS
-- ==========================================

-- Add storyline linkage to existing life events table
ALTER TABLE battler_life_events
ADD COLUMN IF NOT EXISTS storyline_id UUID REFERENCES active_storylines(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS chapter_id TEXT,
ADD COLUMN IF NOT EXISTS prep_days_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_storyline_chapter BOOLEAN DEFAULT false;

-- Index for storyline-linked events
CREATE INDEX IF NOT EXISTS idx_battler_life_events_storyline
  ON battler_life_events(storyline_id) WHERE storyline_id IS NOT NULL;

-- ==========================================
-- 4. PREP DAY IMPACTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS prep_day_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  life_event_id UUID REFERENCES battler_life_events(id) ON DELETE CASCADE,
  storyline_id UUID REFERENCES active_storylines(id) ON DELETE CASCADE,
  battle_id UUID REFERENCES battles(id),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,

  -- Impact details
  impact_type TEXT NOT NULL CHECK (impact_type IN (
    'day_loss',        -- Lost entire prep days
    'efficiency_loss', -- Reduced effectiveness
    'focus_lock'       -- Forced to specific focus type
  )),
  days_lost INTEGER DEFAULT 0,
  efficiency_modifier DECIMAL(3,2) DEFAULT 1.0,
  forced_focus TEXT,

  -- Display info
  reason_text TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prep_day_impacts_battler
  ON prep_day_impacts(battler_id);

CREATE INDEX IF NOT EXISTS idx_prep_day_impacts_battle
  ON prep_day_impacts(battle_id) WHERE battle_id IS NOT NULL;

-- RLS
ALTER TABLE prep_day_impacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Battlers can view their own prep impacts"
  ON prep_day_impacts FOR SELECT
  TO authenticated
  USING (
    battler_id IN (
      SELECT id FROM battlers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage prep impacts"
  ON prep_day_impacts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 5. ADD CREW LOYALTY TO BATTLER ATTRIBUTES
-- ==========================================

-- Add hidden crew_loyalty attribute (0-10 scale)
ALTER TABLE battler_attributes
ADD COLUMN IF NOT EXISTS crew_loyalty DECIMAL(3,1) DEFAULT 5.0 CHECK (crew_loyalty >= 0 AND crew_loyalty <= 10);

COMMENT ON COLUMN battler_attributes.crew_loyalty IS 'Hidden attribute tracking gang/crew loyalty (0-10). Affects league bookings and triggers crew events.';

-- ==========================================
-- 6. UPDATE LIFE EVENT TEMPLATES CATEGORY ENUM
-- ==========================================

-- Drop old constraint and add new one with all storyline categories
ALTER TABLE life_event_templates
DROP CONSTRAINT IF EXISTS life_event_templates_category_check;

ALTER TABLE life_event_templates
ADD CONSTRAINT life_event_templates_category_check
CHECK (category IN (
  'career',
  'personal',
  'scandal',
  'financial',
  'relationship',
  -- New storyline categories
  'family',
  'legal',
  'rivalry',
  'health',
  'street',
  'crew',
  'romance'
));

-- ==========================================
-- 7. ADD TRIGGER TYPE FOR STORYLINE EVENTS
-- ==========================================

-- Update trigger_type enum to include storyline chapters
ALTER TABLE life_event_templates
DROP CONSTRAINT IF EXISTS life_event_templates_trigger_type_check;

ALTER TABLE life_event_templates
ADD CONSTRAINT life_event_templates_trigger_type_check
CHECK (trigger_type IN (
  'battle_result',
  'time',
  'attribute',
  'random',
  'storyline_chapter'  -- New: triggered by storyline progression
));

-- ==========================================
-- 8. ADD CHOICE C SUPPORT TO LIFE EVENTS
-- ==========================================

-- Some storyline events have 3 choices
ALTER TABLE life_event_templates
ADD COLUMN IF NOT EXISTS choice_c_text TEXT,
ADD COLUMN IF NOT EXISTS choice_c_effects JSONB;

-- Update chosen_option to allow 'c' option
ALTER TABLE battler_life_events
DROP CONSTRAINT IF EXISTS battler_life_events_chosen_option_check;

ALTER TABLE battler_life_events
ADD CONSTRAINT battler_life_events_chosen_option_check
CHECK (chosen_option IN ('a', 'b', 'c'));
