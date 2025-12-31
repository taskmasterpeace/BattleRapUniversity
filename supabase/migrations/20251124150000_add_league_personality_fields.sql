-- Add promotion personality fields to leagues table
-- These fields transform leagues from simple format definitions into full promotion systems
-- with distinct personalities, audience preferences, and career impacts

ALTER TABLE leagues
ADD COLUMN personality_style TEXT CHECK (personality_style IN ('aggressive', 'technical', 'diverse', 'street')),
ADD COLUMN base_payout INT DEFAULT 2000,
ADD COLUMN prestige_level INT DEFAULT 5 CHECK (prestige_level >= 1 AND prestige_level <= 10),
ADD COLUMN audience_favor_lyricism INT DEFAULT 50 CHECK (audience_favor_lyricism >= 0 AND audience_favor_lyricism <= 100),
ADD COLUMN audience_favor_delivery INT DEFAULT 50 CHECK (audience_favor_delivery >= 0 AND audience_favor_delivery <= 100),
ADD COLUMN audience_favor_storytelling INT DEFAULT 50 CHECK (audience_favor_storytelling >= 0 AND audience_favor_storytelling <= 100),
ADD COLUMN audience_favor_crowd_engagement INT DEFAULT 50 CHECK (audience_favor_crowd_engagement >= 0 AND audience_favor_crowd_engagement <= 100);

COMMENT ON COLUMN leagues.personality_style IS 'Cultural style of the promotion: aggressive (URL-style energy), technical (KOTD-style bars), diverse (international), street (underground)';
COMMENT ON COLUMN leagues.base_payout IS 'Base compensation in dollars per battle. Used to calculate actual battle payouts based on battler rating.';
COMMENT ON COLUMN leagues.prestige_level IS 'Prestige rating 1-10. Higher prestige = bigger reputation gains from wins, more media coverage.';
COMMENT ON COLUMN leagues.audience_favor_lyricism IS 'How much this promotion''s audience values technical lyricism (0-100 scale). Higher = writing matters more for crowd reactions.';
COMMENT ON COLUMN leagues.audience_favor_delivery IS 'How much this promotion''s audience values delivery and vocal performance (0-100). Higher = delivery matters more for crowd.';
COMMENT ON COLUMN leagues.audience_favor_storytelling IS 'How much this promotion''s audience values narrative and storytelling (0-100).';
COMMENT ON COLUMN leagues.audience_favor_crowd_engagement IS 'How much this promotion''s audience values crowd interaction and energy (0-100). Higher = crowd control matters more.';
