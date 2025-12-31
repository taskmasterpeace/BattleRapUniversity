-- Seed Life Event Templates That Create Secrets
-- These templates demonstrate the new secret integration in the life events system
-- Categories available: 'career', 'personal', 'scandal', 'financial', 'relationship'
-- Severities available: 'minor', 'moderate', 'major', 'critical'
-- Trigger types available: 'battle_result', 'time', 'attribute', 'random', 'storyline_chapter'

-- ==========================================
-- 1. CHOKE CREATES SECRET (Battle Result Trigger)
-- ==========================================

INSERT INTO life_event_templates (
  code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects,
  category, severity
) VALUES (
  'CHOKE_FOOTAGE_LEAKED',
  'The Footage Is Out',
  'Someone uploaded your choke to social media. The video is getting views and people are talking. How do you handle it?',
  'battle_result',
  '{"choked": true, "was_high_profile": true}',
  'Get ahead of it - post your own reaction video',
  '[{"type": "permanent", "reputation": -0.5, "create_secret": {"secret_type": "mental_health", "title": "Known Choker", "description": "Has a documented history of choking under pressure in high-stakes battles", "severity": "major", "exposure_risk": 0.30, "battle_vulnerability": {"angle_bonus": 0.20, "crowd_reaction_penalty": -15}}}]',
  'Stay silent and hope it blows over',
  '[{"type": "permanent", "stress": 15, "create_secret": {"secret_type": "mental_health", "title": "Struggles Under Pressure", "description": "Privately dealing with performance anxiety after a public choke", "severity": "moderate", "exposure_risk": 0.15, "battle_vulnerability": {"angle_bonus": 0.15, "crowd_reaction_penalty": -10}}}]',
  'career',
  'major'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 2. FINANCIAL CRISIS CREATES SECRET (Attribute Trigger)
-- ==========================================

INSERT INTO life_event_templates (
  code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects,
  category, severity
) VALUES (
  'FINANCIAL_CRISIS_SECRET',
  'Bills Piling Up',
  'You''re behind on rent. The stress is showing in your face. Someone might notice if you don''t handle this.',
  'attribute',
  '{"attribute": "financial_stability", "operator": "<=", "value": 3}',
  'Take a quick-money gig (may hurt reputation)',
  '[{"type": "permanent", "financial_stability": 1.5, "reputation": -0.5}]',
  'Keep it quiet and grind harder',
  '[{"type": "permanent", "stress": 20, "create_secret": {"secret_type": "financial_crisis", "title": "Struggling Financially", "description": "Can barely pay bills, under serious financial pressure. Opponents might use this as an angle.", "severity": "moderate", "exposure_risk": 0.10, "battle_vulnerability": {"angle_bonus": 0.15, "crowd_reaction_penalty": -8}}}]',
  'financial',
  'moderate'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 3. FAMILY SCANDAL EXPOSURE (Random Trigger)
-- ==========================================

INSERT INTO life_event_templates (
  code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects,
  category, severity
) VALUES (
  'FAMILY_SCANDAL_EMERGES',
  'Family Business',
  'Someone from your past is talking to bloggers about your family. The story might break any day now.',
  'random',
  '{"probability": 0.05, "min_battles": 10}',
  'Get ahead of the story - control the narrative',
  '[{"type": "permanent", "reputation": -0.3, "expose_secret": {"secret_type": "family_scandal", "new_status": "addressed", "exposed_by": "life_event"}}]',
  'Deny everything and hope it goes away',
  '[{"type": "permanent", "stress": 25, "modify_secret": {"secret_type": "family_scandal", "exposure_risk_delta": 0.20}}]',
  'scandal',
  'major'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 4. RELATIONSHIP DRAMA CREATES SECRET (Random Trigger)
-- ==========================================

INSERT INTO life_event_templates (
  code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects,
  category, severity
) VALUES (
  'RELATIONSHIP_DRAMA_PRIVATE',
  'Messy Situation',
  'Your relationship is falling apart. The arguments are getting loud. Neighbors are starting to talk.',
  'random',
  '{"probability": 0.08, "min_battles": 5}',
  'Work it out privately',
  '[{"type": "permanent", "family_bond": -0.5, "stress": 10, "create_secret": {"secret_type": "relationship_drama", "title": "Relationship Problems", "description": "Going through serious relationship issues that could affect focus and preparation", "severity": "moderate", "exposure_risk": 0.12, "battle_vulnerability": {"angle_bonus": 0.12, "crowd_reaction_penalty": -5}}}]',
  'End things publicly and move on',
  '[{"type": "permanent", "reputation": -0.3, "family_bond": -1.0, "stress": -5}]',
  'relationship',
  'moderate'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 5. LEGAL TROUBLE CREATES SECRET (Random Trigger)
-- ==========================================

INSERT INTO life_event_templates (
  code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects,
  category, severity
) VALUES (
  'LEGAL_TROUBLE_SECRET',
  'Caught Up',
  'You got pulled over. The situation escalated. Now you have court dates coming up.',
  'random',
  '{"probability": 0.04, "min_battles": 8}',
  'Get a lawyer and fight it',
  '[{"type": "permanent", "financial_stability": -1.0, "create_secret": {"secret_type": "criminal_record", "title": "Pending Legal Case", "description": "Has a pending legal case that could affect career and travel", "severity": "major", "exposure_risk": 0.25, "battle_vulnerability": {"angle_bonus": 0.18, "crowd_reaction_penalty": -12}}}]',
  'Take the plea deal',
  '[{"type": "permanent", "reputation": -0.5, "create_secret": {"secret_type": "criminal_record", "title": "Criminal Record", "description": "Has a conviction on record - opponents might use this", "severity": "major", "exposure_risk": 0.35, "battle_vulnerability": {"angle_bonus": 0.22, "crowd_reaction_penalty": -15}}}]',
  'scandal',
  'major'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 6. SUBSTANCE USE SECRET (Battle Result - Loss Streak)
-- ==========================================

INSERT INTO life_event_templates (
  code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects,
  category, severity
) VALUES (
  'COPING_MECHANISM',
  'Taking the Edge Off',
  'The losses have been piling up. You''ve been using something to cope with the stress. It''s starting to become a habit.',
  'battle_result',
  '{"outcome": "loss", "streak_count": 3}',
  'Get help before it gets worse',
  '[{"type": "permanent", "stress": -15, "financial_stability": -0.5, "resilience": 0.5}]',
  'You can handle it - just need to win',
  '[{"type": "permanent", "stress": 10, "create_secret": {"secret_type": "substance_use", "title": "Substance Dependency", "description": "Relying on substances to cope with the pressure of battle rap", "severity": "major", "exposure_risk": 0.08, "battle_vulnerability": {"angle_bonus": 0.25, "crowd_reaction_penalty": -18}}}]',
  'personal',
  'major'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 7. CAREER FAILURE SECRET (Battle Result Trigger)
-- ==========================================

INSERT INTO life_event_templates (
  code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects,
  category, severity
) VALUES (
  'BODIED_ON_BIG_STAGE',
  'The Body Bag',
  'You got bodied 3-0 on a major platform. The footage is everywhere. Your stock is falling fast.',
  'battle_result',
  '{"score": "0-3", "was_high_profile": true}',
  'Immediately call for the rematch',
  '[{"type": "permanent", "reputation": -0.3, "stress": 15}]',
  'Step back and regroup quietly',
  '[{"type": "permanent", "stress": 20, "create_secret": {"secret_type": "career_failure", "title": "Got Bodied", "description": "Suffered a devastating loss that damaged confidence and reputation", "severity": "moderate", "exposure_risk": 0.40, "battle_vulnerability": {"angle_bonus": 0.15, "crowd_reaction_penalty": -10}}}]',
  'career',
  'major'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 8. BETRAYAL SECRET (Random Trigger)
-- ==========================================

INSERT INTO life_event_templates (
  code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects,
  category, severity
) VALUES (
  'CREW_BETRAYAL',
  'Stabbed in the Back',
  'Someone you trusted sold you out. They gave your angles and secrets to an opponent. The betrayal stings.',
  'random',
  '{"probability": 0.03, "min_battles": 15}',
  'Call them out publicly',
  '[{"type": "permanent", "reputation": 0.3, "stress": 10, "expose_secret": {"secret_type": "betrayal", "new_status": "exposed", "exposed_by": "life_event"}}]',
  'Cut them off quietly',
  '[{"type": "permanent", "stress": 15, "create_secret": {"secret_type": "betrayal", "title": "Trust Issues", "description": "Was betrayed by someone close, now has difficulty trusting others", "severity": "minor", "exposure_risk": 0.05, "battle_vulnerability": {"angle_bonus": 0.10, "crowd_reaction_penalty": -5}}}]',
  'relationship',
  'moderate'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 9. SECRET IDENTITY DISCOVERY (Random Trigger)
-- ==========================================

INSERT INTO life_event_templates (
  code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects,
  category, severity
) VALUES (
  'DAY_JOB_DISCOVERED',
  'Who You Really Are',
  'Someone found out about your day job. The one you''ve been keeping secret because it doesn''t fit your battle rap image.',
  'random',
  '{"probability": 0.06, "min_battles": 12}',
  'Own it - "I''m multi-dimensional"',
  '[{"type": "permanent", "reputation": 0.2, "expose_secret": {"secret_type": "secret_identity", "new_status": "addressed", "exposed_by": "life_event"}}]',
  'Deny it and threaten to sue',
  '[{"type": "permanent", "stress": 20, "modify_secret": {"secret_type": "secret_identity", "exposure_risk_delta": 0.15}}]',
  'career',
  'minor'
) ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 10. MENTAL HEALTH SECRET (Battle Result - Win Streak Pressure)
-- ==========================================

INSERT INTO life_event_templates (
  code, title, description, trigger_type, trigger_condition,
  choice_a_text, choice_a_effects, choice_b_text, choice_b_effects,
  category, severity
) VALUES (
  'SUCCESS_PRESSURE',
  'The Weight of Expectations',
  'You''ve been winning. Now everyone expects you to keep winning. The pressure is getting to you. You''re having trouble sleeping.',
  'battle_result',
  '{"outcome": "win", "streak_count": 5}',
  'Talk to someone about it',
  '[{"type": "permanent", "stress": -10, "resilience": 0.3}]',
  'Push through - winners don''t complain',
  '[{"type": "permanent", "stress": 15, "create_secret": {"secret_type": "mental_health", "title": "Anxiety Under Success", "description": "Struggling with the pressure of maintaining a winning streak", "severity": "moderate", "exposure_risk": 0.08, "battle_vulnerability": {"angle_bonus": 0.12, "crowd_reaction_penalty": -8}}}]',
  'personal',
  'moderate'
) ON CONFLICT (code) DO NOTHING;

-- Log what we created
DO $$
BEGIN
  RAISE NOTICE 'Seeded 10 secret-generating life event templates';
END $$;
