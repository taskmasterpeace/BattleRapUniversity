-- ============================================================================
-- THE NEWSROOM  (goal 2026-08-27)
--   1. Life-event SUBCATEGORIES — finer beats inside the five worlds.
--   2. story_leads         — a happening becomes a newsworthy lead.
--   3. blogger_assignments — a blogger LANDS a lead, SITS on it, then DROPS it.
--   4. more beat-specialised blogger accounts so leads are actually competed for.
--
-- A lead's life:  open -> (a blogger claims it) claimed -> published
--                                              \-> cold  (nobody bit, or sat too long)
-- Publishing = a Wire post (+ optional news article) on the blogger's cadence:
-- posting_frequency drives how long they sit (0.9 ~ twice a week, 0.6 ~ weekly).
-- ============================================================================

-- 1. Life-event depth --------------------------------------------------------
ALTER TABLE life_event_templates
  ADD COLUMN IF NOT EXISTS subcategory text;

COMMENT ON COLUMN life_event_templates.subcategory IS
  'Finer beat inside category (e.g. financial/got_stiffed, scandal/beef). Drives blogger beat-fit and future per-subcategory art.';

-- Re-home + subcategorise the seeded templates. They ALL shipped as
-- career/moderate; give them their real world + beat + severity.
UPDATE life_event_templates SET category='career',       subcategory='statement_win', severity='major'    WHERE code IN ('DOMINANT_VICTORY','BODYBAG_HYPE');
UPDATE life_event_templates SET category='career',       subcategory='hot_streak',    severity='major'    WHERE code IN ('WIN_STREAK_3','WIN_STREAK_5');
UPDATE life_event_templates SET category='career',       subcategory='close_call',    severity='moderate' WHERE code IN ('CLOSE_VICTORY','NARROW_LOSS');
UPDATE life_event_templates SET category='career',       subcategory='bad_night',     severity='major'    WHERE code IN ('BAD_LOSS');
UPDATE life_event_templates SET category='career',       subcategory='slump',         severity='critical' WHERE code IN ('CAREER_CRISIS');
UPDATE life_event_templates SET category='career',       subcategory='league_move',   severity='moderate' WHERE code IN ('VENUE_CHANGE');
UPDATE life_event_templates SET category='career',       subcategory='press',         severity='minor'    WHERE code IN ('MEDIA_INTERVIEW');
UPDATE life_event_templates SET category='scandal',      subcategory='robbed',        severity='major'    WHERE code IN ('CONTROVERSIAL_LOSS');
UPDATE life_event_templates SET category='scandal',      subcategory='beef',          severity='major'    WHERE code IN ('RIVAL_CALLOUT');
UPDATE life_event_templates SET category='personal',     subcategory='confidence',    severity='major'    WHERE code IN ('CHOKE_EVENT','CHOKE_IN_BIG_BATTLE');
UPDATE life_event_templates SET category='personal',     subcategory='health',        severity='moderate' WHERE code IN ('INJURY_MINOR');
UPDATE life_event_templates SET category='financial',    subcategory='broke',         severity='major'    WHERE code IN ('FINANCIAL_CRISIS');
UPDATE life_event_templates SET category='relationship', subcategory='family',        severity='minor'    WHERE code IN ('FAMILY_WEDDING');
UPDATE life_event_templates SET category='relationship', subcategory='camp',          severity='minor'    WHERE code IN ('TRAINING_PARTNER');

-- 2. story_leads -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS story_leads (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type            text NOT NULL,          -- battle | life_event | milestone | streak | beef | callout | money | scandal
  category             text NOT NULL,          -- career | financial | scandal | personal | relationship | battle
  subcategory          text,                   -- finer beat (see taxonomy)
  subject_battler_id   uuid NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  secondary_battler_id uuid REFERENCES battlers(id) ON DELETE SET NULL,
  source_ref_id        uuid,                   -- battle id / life_event id / etc (not FK: polymorphic)
  headline_hint        text NOT NULL,          -- short 'what happened' used to fill templates
  summary              text,                   -- optional longer context
  heat                 numeric NOT NULL DEFAULT 50 CHECK (heat >= 0),   -- newsworthiness, decays each tick
  status               text NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open','claimed','published','cold')),
  claim_count          int NOT NULL DEFAULT 0, -- how many bloggers are on it (allows competing coverage)
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  meta_json            jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_story_leads_status   ON story_leads(status, heat DESC);
CREATE INDEX IF NOT EXISTS idx_story_leads_subject  ON story_leads(subject_battler_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_leads_open      ON story_leads(created_at DESC) WHERE status = 'open';
-- One lead per (source happening, beat) — a battle can't spawn 5 identical leads.
CREATE UNIQUE INDEX IF NOT EXISTS uq_story_leads_source
  ON story_leads(source_ref_id, lead_type, subcategory)
  WHERE source_ref_id IS NOT NULL;

COMMENT ON TABLE story_leads IS 'The Newsroom: a newsworthy happening waiting for a blogger to pick it up.';

-- 3. blogger_assignments -----------------------------------------------------
CREATE TABLE IF NOT EXISTS blogger_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       uuid NOT NULL REFERENCES story_leads(id) ON DELETE CASCADE,
  account_id    uuid NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  claimed_at    timestamptz NOT NULL DEFAULT now(),
  publish_after timestamptz NOT NULL,          -- the SIT: when they plan to drop it
  sit_reason    text NOT NULL                  -- breaking | developing | building_it | backburner
                  CHECK (sit_reason IN ('breaking','developing','building_it','backburner')),
  status        text NOT NULL DEFAULT 'holding'
                  CHECK (status IN ('holding','published','killed')),
  wire_post_id  uuid REFERENCES wire_posts(id) ON DELETE SET NULL,
  article_id    uuid REFERENCES news_articles(id) ON DELETE SET NULL,
  meta_json     jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (lead_id, account_id)                 -- a blogger can't claim the same lead twice
);

CREATE INDEX IF NOT EXISTS idx_assign_holding    ON blogger_assignments(publish_after) WHERE status = 'holding';
CREATE INDEX IF NOT EXISTS idx_assign_account    ON blogger_assignments(account_id, claimed_at DESC);
CREATE INDEX IF NOT EXISTS idx_assign_lead       ON blogger_assignments(lead_id);

COMMENT ON TABLE blogger_assignments IS 'A blogger landed a lead and is sitting on it until publish_after, then drops it as a Wire post.';

-- RLS: readable by all (it feeds "developing stories"), writable by service role.
ALTER TABLE story_leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogger_assignments  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS story_leads_read ON story_leads;
CREATE POLICY story_leads_read ON story_leads FOR SELECT USING (true);
DROP POLICY IF EXISTS story_leads_service ON story_leads;
CREATE POLICY story_leads_service ON story_leads FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS assign_read ON blogger_assignments;
CREATE POLICY assign_read ON blogger_assignments FOR SELECT USING (true);
DROP POLICY IF EXISTS assign_service ON blogger_assignments;
CREATE POLICY assign_service ON blogger_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. More beat-specialised bloggers -----------------------------------------
-- Distinct beats so leads are genuinely competed for. voice_profile reuses the
-- Wire voice banks; the newsroom beat map (lib/game/newsroom/beats.ts) keys off
-- both voice_profile and handle.
INSERT INTO social_accounts (handle, display_name, kind, voice_profile, influence, credibility, controversy_tolerance, posting_frequency, stamped)
VALUES
  ('@TheSmokeReport', 'The Smoke Report', 'blogger', 'analyst_news',    68, 55, 95, 0.9, true),
  ('@BankRollBattles','Bankroll Battles',  'blogger', 'analyst_measured',52, 82, 40, 0.6, true),
  ('@StreetScribe',   'Street Scribe',     'blogger', 'analyst_moments', 60, 80, 55, 0.7, true),
  ('@BarsBreakdown',  'Bars Breakdown',    'blogger', 'analyst_rankings',63, 86, 35, 0.7, true)
ON CONFLICT (handle) DO NOTHING;
