-- Migration: Add Social Features System
-- Description: Crews, Thrones, Media Reactions, Grudge Actions
-- Date: December 3, 2025

-- =====================================================
-- TABLE 1: bloggers (for media reactions credibility)
-- =====================================================

CREATE TABLE IF NOT EXISTS bloggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  handle TEXT NOT NULL UNIQUE,
  persona TEXT NOT NULL,
  style TEXT NOT NULL,
  credibility_score INT NOT NULL DEFAULT 50 CHECK (credibility_score >= 0 AND credibility_score <= 100),
  facts_count INT NOT NULL DEFAULT 0,
  cap_count INT NOT NULL DEFAULT 0,
  fire_count INT NOT NULL DEFAULT 0,
  mid_count INT NOT NULL DEFAULT 0,
  total_articles INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the 8 bloggers from newsGenerator.ts
INSERT INTO bloggers (name, handle, persona, style) VALUES
  ('Battle Eyez', '@battleeyez', 'The hardcore purist who values bars above all', 'technical'),
  ('Marijuana Piranha', '@mjpiranha', 'Laid-back critic who appreciates creativity', 'creative'),
  ('Algorithm Institute', '@algoinsitute', 'Statistical analyst who breaks down performance', 'analytical'),
  ('Small Room Report', '@smallroomrpt', 'Underground scene expert', 'underground'),
  ('The Main Stage Herald', '@mainstageherald', 'Premier event coverage specialist', 'mainstream'),
  ('Underground Voice', '@undergroundvoice', 'Champion of up-and-coming talent', 'grassroots'),
  ('Coast to Coast Coverage', '@coast2coast', 'National scene reporter', 'regional'),
  ('The Battle Breakdown', '@battlebreakdown', 'Round-by-round analysis expert', 'detailed')
ON CONFLICT (name) DO NOTHING;

-- RLS for bloggers
ALTER TABLE bloggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bloggers_select_policy"
ON bloggers FOR SELECT
USING (true);

CREATE POLICY "bloggers_service_policy"
ON bloggers FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 2: article_reactions
-- =====================================================

CREATE TABLE IF NOT EXISTS article_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  battler_id UUID REFERENCES battlers(id) ON DELETE SET NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('facts', 'cap', 'fire', 'mid', 'debatable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (article_id, user_id)
);

-- Indexes
CREATE INDEX idx_article_reactions_article ON article_reactions(article_id);
CREATE INDEX idx_article_reactions_user ON article_reactions(user_id);
CREATE INDEX idx_article_reactions_type ON article_reactions(reaction_type);

-- RLS
ALTER TABLE article_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "article_reactions_select_policy"
ON article_reactions FOR SELECT
USING (true);

CREATE POLICY "article_reactions_insert_policy"
ON article_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "article_reactions_delete_policy"
ON article_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add reaction counts to news_articles
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS reaction_counts JSONB DEFAULT '{"facts": 0, "cap": 0, "fire": 0, "mid": 0, "debatable": 0}'::jsonb;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS blogger_id UUID REFERENCES bloggers(id);

-- =====================================================
-- TABLE 3: grudge_actions (player-driven grudge escalation)
-- =====================================================

CREATE TABLE IF NOT EXISTS grudge_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES battler_relationships(id) ON DELETE CASCADE,
  actor_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  target_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    -- Winner post-battle options
    'good_battle',
    'run_it_back',
    'that_was_easy',
    'career_over',
    -- Loser post-battle options
    'you_got_me',
    'rematch_now',
    'you_got_lucky',
    'i_got_robbed',
    -- Media reactions
    'fire_on_loss',
    'clown_on_win',
    'skull_on_choke',
    -- Call-outs
    'call_out',
    'cosign_call_out'
  )),
  intensity_change INT NOT NULL,
  context TEXT CHECK (context IN ('post_battle', 'media_reaction', 'call_out')),
  battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
  article_id UUID REFERENCES news_articles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_grudge_actions_relationship ON grudge_actions(relationship_id);
CREATE INDEX idx_grudge_actions_actor ON grudge_actions(actor_battler_id);
CREATE INDEX idx_grudge_actions_battle ON grudge_actions(battle_id);
CREATE INDEX idx_grudge_actions_created ON grudge_actions(created_at DESC);

-- RLS
ALTER TABLE grudge_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grudge_actions_select_policy"
ON grudge_actions FOR SELECT
USING (true);

CREATE POLICY "grudge_actions_service_policy"
ON grudge_actions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add action history to battler_relationships
ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS last_action TEXT;
ALTER TABLE battler_relationships ADD COLUMN IF NOT EXISTS action_history JSONB DEFAULT '[]'::jsonb;

-- =====================================================
-- TABLE 4: crews
-- =====================================================

CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  tag TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  leader_battler_id UUID REFERENCES battlers(id),
  reputation INT NOT NULL DEFAULT 50 CHECK (reputation >= 0 AND reputation <= 100),
  total_wins INT NOT NULL DEFAULT 0,
  total_losses INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crews_active ON crews(active);
CREATE INDEX idx_crews_reputation ON crews(reputation DESC);
CREATE INDEX idx_crews_leader ON crews(leader_battler_id);

-- RLS
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crews_select_policy"
ON crews FOR SELECT
USING (true);

CREATE POLICY "crews_insert_policy"
ON crews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "crews_update_policy"
ON crews FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR leader_battler_id IN (
  SELECT id FROM battlers WHERE user_id = auth.uid()
));

CREATE POLICY "crews_service_policy"
ON crews FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 5: crew_members
-- =====================================================

CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (crew_id, battler_id)
);

-- Indexes
CREATE INDEX idx_crew_members_crew ON crew_members(crew_id);
CREATE INDEX idx_crew_members_battler ON crew_members(battler_id);
CREATE INDEX idx_crew_members_user ON crew_members(user_id);
CREATE INDEX idx_crew_members_active ON crew_members(is_active);

-- RLS
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_members_select_policy"
ON crew_members FOR SELECT
USING (true);

CREATE POLICY "crew_members_service_policy"
ON crew_members FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 6: crew_membership_history (permanent record - the angle!)
-- =====================================================

CREATE TABLE IF NOT EXISTS crew_membership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  crew_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL,
  left_at TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crew_history_battler ON crew_membership_history(battler_id);
CREATE INDEX idx_crew_history_crew ON crew_membership_history(crew_id);

-- RLS
ALTER TABLE crew_membership_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_history_select_policy"
ON crew_membership_history FOR SELECT
USING (true);

CREATE POLICY "crew_history_service_policy"
ON crew_membership_history FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 7: crew_assists (prep help, badge borrowing, cosigns)
-- =====================================================

CREATE TABLE IF NOT EXISTS crew_assists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  helper_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  helped_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
  assist_type TEXT NOT NULL CHECK (assist_type IN ('prep', 'badge_borrow', 'cosign')),
  badge_borrowed TEXT,
  prep_bonus DECIMAL(3,2) DEFAULT 0,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crew_assists_crew ON crew_assists(crew_id);
CREATE INDEX idx_crew_assists_helper ON crew_assists(helper_battler_id);
CREATE INDEX idx_crew_assists_helped ON crew_assists(helped_battler_id);
CREATE INDEX idx_crew_assists_battle ON crew_assists(battle_id);

-- RLS
ALTER TABLE crew_assists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_assists_select_policy"
ON crew_assists FOR SELECT
USING (true);

CREATE POLICY "crew_assists_service_policy"
ON crew_assists FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 8: crew_challenges (crew vs crew battles)
-- =====================================================

CREATE TABLE IF NOT EXISTS crew_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  target_crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed')),
  wins_challenger INT NOT NULL DEFAULT 0,
  wins_target INT NOT NULL DEFAULT 0,
  best_of INT NOT NULL DEFAULT 5 CHECK (best_of IN (3, 5, 7)),
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  winner_crew_id UUID REFERENCES crews(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crew_challenges_challenger ON crew_challenges(challenger_crew_id);
CREATE INDEX idx_crew_challenges_target ON crew_challenges(target_crew_id);
CREATE INDEX idx_crew_challenges_status ON crew_challenges(status);

-- RLS
ALTER TABLE crew_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_challenges_select_policy"
ON crew_challenges FOR SELECT
USING (true);

CREATE POLICY "crew_challenges_service_policy"
ON crew_challenges FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 9: throne_positions (league thrones)
-- =====================================================

CREATE TABLE IF NOT EXISTS throne_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  position INT NOT NULL CHECK (position IN (1, 2, 3)),
  battler_id UUID REFERENCES battlers(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  defense_count INT NOT NULL DEFAULT 0,
  UNIQUE (league_id, position)
);

-- Indexes
CREATE INDEX idx_throne_positions_league ON throne_positions(league_id);
CREATE INDEX idx_throne_positions_battler ON throne_positions(battler_id);

-- RLS
ALTER TABLE throne_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "throne_positions_select_policy"
ON throne_positions FOR SELECT
USING (true);

CREATE POLICY "throne_positions_service_policy"
ON throne_positions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 10: throne_history
-- =====================================================

CREATE TABLE IF NOT EXISTS throne_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  position INT NOT NULL CHECK (position IN (1, 2, 3)),
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  defense_count INT NOT NULL DEFAULT 0,
  lost_to_battler_id UUID REFERENCES battlers(id) ON DELETE SET NULL,
  lost_battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_throne_history_league ON throne_history(league_id);
CREATE INDEX idx_throne_history_battler ON throne_history(battler_id);
CREATE INDEX idx_throne_history_position ON throne_history(position);
CREATE INDEX idx_throne_history_started ON throne_history(started_at DESC);

-- RLS
ALTER TABLE throne_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "throne_history_select_policy"
ON throne_history FOR SELECT
USING (true);

CREATE POLICY "throne_history_service_policy"
ON throne_history FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 11: throne_challenges
-- =====================================================

CREATE TABLE IF NOT EXISTS throne_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  challenger_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  throne_holder_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  target_position INT NOT NULL CHECK (target_position IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'forfeited', 'completed')),
  deadline TIMESTAMPTZ NOT NULL,
  battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
  result TEXT CHECK (result IN ('challenger_won', 'defender_won', 'forfeited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_throne_challenges_league ON throne_challenges(league_id);
CREATE INDEX idx_throne_challenges_challenger ON throne_challenges(challenger_battler_id);
CREATE INDEX idx_throne_challenges_holder ON throne_challenges(throne_holder_battler_id);
CREATE INDEX idx_throne_challenges_status ON throne_challenges(status);

-- RLS
ALTER TABLE throne_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "throne_challenges_select_policy"
ON throne_challenges FOR SELECT
USING (true);

CREATE POLICY "throne_challenges_service_policy"
ON throne_challenges FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 12: call_outs (public challenge board)
-- =====================================================

CREATE TABLE IF NOT EXISTS call_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  target_battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  template TEXT NOT NULL CHECK (template IN (
    'bars_are_basic',
    'not_ready_for_league',
    'body_you_30',
    'stop_ducking',
    'throne_is_mine',
    'custom'
  )),
  custom_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'countered', 'ignored', 'expired')),
  stake_amount INT DEFAULT 0,
  league_id UUID REFERENCES leagues(id),
  cosign_count INT NOT NULL DEFAULT 0,
  response_deadline TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  battle_id UUID REFERENCES battles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_call_outs_caller ON call_outs(caller_battler_id);
CREATE INDEX idx_call_outs_target ON call_outs(target_battler_id);
CREATE INDEX idx_call_outs_status ON call_outs(status);
CREATE INDEX idx_call_outs_league ON call_outs(league_id);

-- RLS
ALTER TABLE call_outs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_outs_select_policy"
ON call_outs FOR SELECT
USING (true);

CREATE POLICY "call_outs_service_policy"
ON call_outs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- TABLE 13: call_out_cosigns (crew members backing call-outs)
-- =====================================================

CREATE TABLE IF NOT EXISTS call_out_cosigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_out_id UUID NOT NULL REFERENCES call_outs(id) ON DELETE CASCADE,
  battler_id UUID NOT NULL REFERENCES battlers(id) ON DELETE CASCADE,
  crew_id UUID REFERENCES crews(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (call_out_id, battler_id)
);

-- Indexes
CREATE INDEX idx_call_out_cosigns_call_out ON call_out_cosigns(call_out_id);
CREATE INDEX idx_call_out_cosigns_battler ON call_out_cosigns(battler_id);

-- RLS
ALTER TABLE call_out_cosigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_out_cosigns_select_policy"
ON call_out_cosigns FOR SELECT
USING (true);

CREATE POLICY "call_out_cosigns_service_policy"
ON call_out_cosigns FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- Add crew_id to battlers for current affiliation
-- =====================================================

ALTER TABLE battlers ADD COLUMN IF NOT EXISTS crew_id UUID REFERENCES crews(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_battlers_crew ON battlers(crew_id);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to record grudge action and update relationship
CREATE OR REPLACE FUNCTION record_grudge_action(
  p_actor_battler_id UUID,
  p_target_battler_id UUID,
  p_action_type TEXT,
  p_context TEXT,
  p_battle_id UUID DEFAULT NULL,
  p_article_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_relationship_id UUID;
  v_intensity_change INT;
  v_action_id UUID;
BEGIN
  -- Get or create relationship
  SELECT get_or_create_relationship(p_actor_battler_id, p_target_battler_id) INTO v_relationship_id;

  -- Determine intensity change based on action type
  v_intensity_change := CASE p_action_type
    -- Winner options
    WHEN 'good_battle' THEN -5
    WHEN 'run_it_back' THEN 20
    WHEN 'that_was_easy' THEN 30
    WHEN 'career_over' THEN 50
    -- Loser options
    WHEN 'you_got_me' THEN -10
    WHEN 'rematch_now' THEN 20
    WHEN 'you_got_lucky' THEN 25
    WHEN 'i_got_robbed' THEN 35
    -- Media reactions
    WHEN 'fire_on_loss' THEN 5
    WHEN 'clown_on_win' THEN 10
    WHEN 'skull_on_choke' THEN 15
    -- Call-outs
    WHEN 'call_out' THEN 15
    WHEN 'cosign_call_out' THEN 5
    ELSE 0
  END;

  -- Insert grudge action
  INSERT INTO grudge_actions (
    relationship_id,
    actor_battler_id,
    target_battler_id,
    action_type,
    intensity_change,
    context,
    battle_id,
    article_id
  ) VALUES (
    v_relationship_id,
    p_actor_battler_id,
    p_target_battler_id,
    p_action_type,
    v_intensity_change,
    p_context,
    p_battle_id,
    p_article_id
  ) RETURNING id INTO v_action_id;

  -- Update relationship intensity (capped at 0-100)
  UPDATE battler_relationships
  SET
    intensity = GREATEST(0, LEAST(100, intensity + v_intensity_change)),
    last_action = p_action_type,
    action_history = action_history || jsonb_build_object(
      'action', p_action_type,
      'actor', p_actor_battler_id,
      'change', v_intensity_change,
      'at', NOW()
    )
  WHERE id = v_relationship_id;

  RETURN v_action_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update article reaction counts
CREATE OR REPLACE FUNCTION update_article_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE news_articles
    SET reaction_counts = jsonb_set(
      reaction_counts,
      ARRAY[NEW.reaction_type],
      to_jsonb(COALESCE((reaction_counts->>NEW.reaction_type)::int, 0) + 1)
    )
    WHERE id = NEW.article_id;

    -- Update blogger credibility
    IF NEW.reaction_type = 'facts' THEN
      UPDATE bloggers SET facts_count = facts_count + 1, credibility_score = LEAST(100, credibility_score + 1)
      WHERE id = (SELECT blogger_id FROM news_articles WHERE id = NEW.article_id);
    ELSIF NEW.reaction_type = 'cap' THEN
      UPDATE bloggers SET cap_count = cap_count + 1, credibility_score = GREATEST(0, credibility_score - 2)
      WHERE id = (SELECT blogger_id FROM news_articles WHERE id = NEW.article_id);
    ELSIF NEW.reaction_type = 'fire' THEN
      UPDATE bloggers SET fire_count = fire_count + 1
      WHERE id = (SELECT blogger_id FROM news_articles WHERE id = NEW.article_id);
    ELSIF NEW.reaction_type = 'mid' THEN
      UPDATE bloggers SET mid_count = mid_count + 1
      WHERE id = (SELECT blogger_id FROM news_articles WHERE id = NEW.article_id);
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE news_articles
    SET reaction_counts = jsonb_set(
      reaction_counts,
      ARRAY[OLD.reaction_type],
      to_jsonb(GREATEST(0, COALESCE((reaction_counts->>OLD.reaction_type)::int, 0) - 1))
    )
    WHERE id = OLD.article_id;

    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_reactions_count_trigger
AFTER INSERT OR DELETE ON article_reactions
FOR EACH ROW
EXECUTE FUNCTION update_article_reaction_counts();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE bloggers IS 'Battle rap media bloggers with credibility tracking';
COMMENT ON TABLE article_reactions IS 'Player reactions to news articles (facts/cap/fire/mid/debatable)';
COMMENT ON TABLE grudge_actions IS 'Player-driven actions that affect rivalry intensity';
COMMENT ON TABLE crews IS 'Player-formed crews/alliances';
COMMENT ON TABLE crew_members IS 'Current crew memberships';
COMMENT ON TABLE crew_membership_history IS 'Permanent record of all crew affiliations (the angle!)';
COMMENT ON TABLE crew_assists IS 'Prep help, badge borrowing, and cosigns between crew members';
COMMENT ON TABLE crew_challenges IS 'Crew vs crew battle series';
COMMENT ON TABLE throne_positions IS 'Current throne holders per league (top 3)';
COMMENT ON TABLE throne_history IS 'Historical throne reigns';
COMMENT ON TABLE throne_challenges IS 'Challenges to throne holders';
COMMENT ON TABLE call_outs IS 'Public challenge board';
COMMENT ON TABLE call_out_cosigns IS 'Crew members backing call-outs';
