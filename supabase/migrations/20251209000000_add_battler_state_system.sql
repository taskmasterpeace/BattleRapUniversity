-- Migration: Add Battler Life State System
-- Purpose: Track persistent battler state (legal, family, financial, health, street, career)
-- Also adds NPCs, scheduled events, and storyline completions tracking

-- =============================================================================
-- TABLE: battler_life_state
-- Persistent state tracking for each battler
-- =============================================================================

CREATE TABLE IF NOT EXISTS battler_life_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- LEGAL STATUS
  has_felony BOOLEAN DEFAULT false,
  felony_type TEXT,                           -- "assault", "drug possession", etc.
  on_probation BOOLEAN DEFAULT false,
  probation_ends_at TIMESTAMPTZ,
  has_pending_charges BOOLEAN DEFAULT false,
  pending_charges JSONB DEFAULT '[]',         -- ["assault", "tax evasion"]
  passport_status TEXT DEFAULT 'valid',       -- 'valid', 'expired', 'revoked', 'none'
  can_travel_international BOOLEAN DEFAULT true,

  -- FAMILY STATUS
  relationship_status TEXT DEFAULT 'single',  -- 'single','dating','engaged','married','divorced','widowed','complicated'
  partner_id UUID,                            -- Reference to battler_npcs
  partner_relationship_health INTEGER DEFAULT 5 CHECK (partner_relationship_health >= 0 AND partner_relationship_health <= 10),
  has_children BOOLEAN DEFAULT false,
  children_count INTEGER DEFAULT 0,
  custody_status TEXT,                        -- 'full', 'shared', 'none', 'child_support_only'
  mother_alive BOOLEAN DEFAULT true,
  father_alive BOOLEAN DEFAULT true,
  family_estranged BOOLEAN DEFAULT false,

  -- FINANCIAL STATUS
  in_debt BOOLEAN DEFAULT false,
  debt_amount INTEGER DEFAULT 0,
  debt_type TEXT,                             -- 'loan', 'gambling', 'taxes', 'child_support', 'loan_shark'
  has_tax_issues BOOLEAN DEFAULT false,
  bankruptcy_filed BOOLEAN DEFAULT false,

  -- HEALTH STATUS
  has_active_injury BOOLEAN DEFAULT false,
  injury_type TEXT,
  injury_severity TEXT,                       -- 'minor', 'moderate', 'severe'
  injury_heals_at TIMESTAMPTZ,
  in_rehab BOOLEAN DEFAULT false,
  rehab_ends_at TIMESTAMPTZ,
  has_chronic_condition BOOLEAN DEFAULT false,
  chronic_condition_type TEXT,

  -- STREET/CREW STATUS
  gang_affiliated BOOLEAN DEFAULT false,
  gang_name TEXT,
  gang_rank TEXT,                             -- 'associate', 'member', 'og'
  has_street_enemies BOOLEAN DEFAULT false,
  street_heat_level INTEGER DEFAULT 0 CHECK (street_heat_level >= 0 AND street_heat_level <= 10),

  -- CAREER STATUS
  signed_to_label BOOLEAN DEFAULT false,
  label_name TEXT,
  contract_battles_remaining INTEGER,
  contract_ends_at TIMESTAMPTZ,
  has_manager BOOLEAN DEFAULT false,
  manager_id UUID,                            -- Reference to battler_npcs
  has_ghostwriting_secret BOOLEAN DEFAULT false,
  league_banned_from TEXT[],                  -- Array of league slugs

  -- META
  created_at TIMESTAMPTZ DEFAULT now(),
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  state_version INTEGER DEFAULT 1
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_battler_life_state_battler ON battler_life_state(battler_id);

-- =============================================================================
-- TABLE: battler_npcs
-- Named characters that persist in storylines (family, partners, enemies, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS battler_npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE NOT NULL,

  -- Identity
  name TEXT NOT NULL,                         -- "Keisha", "Marcus", "Big Tony"
  nickname TEXT,                              -- "Your baby mama", "Your brother"
  gender TEXT NOT NULL,                       -- 'male', 'female', 'nonbinary'

  -- Relationship
  relationship_type TEXT NOT NULL,            -- see comment below
  relationship_health INTEGER DEFAULT 5 CHECK (relationship_health >= 0 AND relationship_health <= 10),
  introduced_in_storyline TEXT,               -- storyline code that introduced them

  -- Status
  status TEXT DEFAULT 'active',               -- 'active', 'deceased', 'estranged', 'incarcerated', 'moved_away'
  status_changed_at TIMESTAMPTZ,
  status_reason TEXT,                         -- "Died from cancer", "In prison for robbery"

  -- For AI context
  personality_notes TEXT,                     -- "Supportive but overbearing"
  history_summary TEXT,                       -- "Met at Summer Madness 2023, dated for 6 months"
  last_interaction TEXT,                      -- Summary of last storyline interaction

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Relationship types:
-- Family: 'mother', 'father', 'brother', 'sister', 'grandmother', 'grandfather',
--         'aunt', 'uncle', 'cousin', 'child', 'son', 'daughter', 'baby_mama', 'baby_daddy'
-- Romantic: 'girlfriend', 'boyfriend', 'wife', 'husband', 'ex', 'fling', 'fiance'
-- Professional: 'manager', 'lawyer', 'accountant', 'label_exec', 'agent', 'publicist'
-- Street: 'og', 'crew_member', 'plug', 'enemy', 'rival', 'shooter'
-- Other: 'friend', 'mentor', 'protege', 'roommate'

CREATE INDEX IF NOT EXISTS idx_battler_npcs_battler ON battler_npcs(battler_id);
CREATE INDEX IF NOT EXISTS idx_battler_npcs_relationship ON battler_npcs(battler_id, relationship_type);

-- =============================================================================
-- TABLE: scheduled_life_events
-- Timeline events that trigger after a delay (pregnancy -> baby birth, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS scheduled_life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE NOT NULL,

  event_type TEXT NOT NULL,                   -- 'baby_birth', 'court_date', 'contract_expires', 'probation_ends', etc.
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Context
  source_storyline_id UUID REFERENCES active_storylines(id) ON DELETE SET NULL,
  source_choice_id TEXT,                      -- Which choice created this
  related_npc_id UUID REFERENCES battler_npcs(id) ON DELETE SET NULL,
  details JSONB NOT NULL DEFAULT '{}',        -- Event-specific data

  -- Status
  triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ,
  resulting_storyline_code TEXT,              -- The storyline this spawned when triggered
  resulting_storyline_id UUID REFERENCES active_storylines(id) ON DELETE SET NULL,

  -- Meta
  priority INTEGER DEFAULT 5,                 -- 1-10, higher = more urgent
  can_be_cancelled BOOLEAN DEFAULT false,
  cancelled BOOLEAN DEFAULT false,
  cancelled_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_life_events_battler ON scheduled_life_events(battler_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_life_events_due ON scheduled_life_events(scheduled_for) WHERE triggered = false;

-- =============================================================================
-- TABLE: storyline_completions
-- Track completed storylines for sequel system and preventing repeats
-- =============================================================================

CREATE TABLE IF NOT EXISTS storyline_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE NOT NULL,
  storyline_code TEXT NOT NULL,

  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ending_id TEXT NOT NULL,
  ending_type TEXT NOT NULL,                  -- 'positive', 'negative', 'neutral', 'catastrophic'

  -- Path tracking
  chapters_visited INTEGER NOT NULL DEFAULT 1,
  choices_made JSONB NOT NULL DEFAULT '[]',   -- Full choice history
  total_prep_days_lost INTEGER DEFAULT 0,

  -- Sequel info
  unlocks_sequel TEXT,                        -- Code of sequel storyline now available
  blocks_storylines TEXT[],                   -- Codes of storylines now blocked

  -- State changes made
  state_changes_applied JSONB,                -- Record of what changed
  npcs_introduced UUID[],                     -- NPCs that were created

  -- Unique constraint: can only complete each storyline once
  CONSTRAINT unique_battler_storyline UNIQUE(battler_id, storyline_code)
);

CREATE INDEX IF NOT EXISTS idx_storyline_completions_battler ON storyline_completions(battler_id);
CREATE INDEX IF NOT EXISTS idx_storyline_completions_code ON storyline_completions(storyline_code);

-- =============================================================================
-- FUNCTION: Initialize life state for new battler
-- =============================================================================

CREATE OR REPLACE FUNCTION initialize_battler_life_state()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO battler_life_state (battler_id)
  VALUES (NEW.id)
  ON CONFLICT (battler_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create life state when battler is created
DROP TRIGGER IF EXISTS trigger_initialize_battler_life_state ON battlers;
CREATE TRIGGER trigger_initialize_battler_life_state
  AFTER INSERT ON battlers
  FOR EACH ROW
  EXECUTE FUNCTION initialize_battler_life_state();

-- =============================================================================
-- FUNCTION: Update last_updated_at timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION update_life_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = now();
  NEW.state_version = OLD.state_version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_life_state_timestamp ON battler_life_state;
CREATE TRIGGER trigger_update_life_state_timestamp
  BEFORE UPDATE ON battler_life_state
  FOR EACH ROW
  EXECUTE FUNCTION update_life_state_timestamp();

-- =============================================================================
-- FUNCTION: Update NPC updated_at timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION update_npc_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_npc_timestamp ON battler_npcs;
CREATE TRIGGER trigger_update_npc_timestamp
  BEFORE UPDATE ON battler_npcs
  FOR EACH ROW
  EXECUTE FUNCTION update_npc_timestamp();

-- =============================================================================
-- Initialize life state for existing battlers
-- =============================================================================

INSERT INTO battler_life_state (battler_id)
SELECT id FROM battlers
WHERE id NOT IN (SELECT battler_id FROM battler_life_state)
ON CONFLICT (battler_id) DO NOTHING;

-- =============================================================================
-- Add state-related fields to storyline_templates if not exists
-- =============================================================================

DO $$
BEGIN
  -- Add sequel/block configuration columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storyline_templates' AND column_name = 'sequel_of') THEN
    ALTER TABLE storyline_templates ADD COLUMN sequel_of TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storyline_templates' AND column_name = 'requires_completion') THEN
    ALTER TABLE storyline_templates ADD COLUMN requires_completion JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storyline_templates' AND column_name = 'on_completion_config') THEN
    ALTER TABLE storyline_templates ADD COLUMN on_completion_config JSONB;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'storyline_templates' AND column_name = 'state_requirements') THEN
    ALTER TABLE storyline_templates ADD COLUMN state_requirements JSONB;
  END IF;
END $$;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE battler_life_state IS 'Persistent life state tracking for battlers - legal, family, financial, health, street, and career status';
COMMENT ON TABLE battler_npcs IS 'Named characters (NPCs) associated with battlers - family members, partners, enemies, professionals';
COMMENT ON TABLE scheduled_life_events IS 'Timeline events scheduled for future dates - baby births, court dates, contract expirations';
COMMENT ON TABLE storyline_completions IS 'Track completed storylines to prevent repeats and enable sequels';
