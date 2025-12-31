-- Phase 6: Seed Choice-Based Life Event Templates
-- Defines battle-result triggered life events with player choices

-- ==========================================
-- BATTLE RESULT TRIGGERED EVENTS
-- ==========================================

insert into life_event_templates (
  code,
  title,
  description,
  trigger_type,
  trigger_condition,
  choice_a_text,
  choice_a_effects,
  choice_b_text,
  choice_b_effects
) values

-- ==========================================
-- DOMINANT VICTORY EVENTS (3-0 wins)
-- ==========================================

(
  'DOMINANT_VICTORY',
  'League Recognition',
  'Your 3-0 bodybag has the league talking. They want you for bigger battles against tougher opponents.',
  'battle_result',
  '{"result": "3-0", "outcome": "win"}'::jsonb,
  'Accept the challenge',
  '{"reputation": 0.5, "public_knowledge": 10}'::jsonb,
  'Stay at current level',
  '{"reputation": -0.2}'::jsonb
),

(
  'BODYBAG_HYPE',
  'Viral Moment',
  'Your dominant performance is going viral. A major platform wants to feature your next battle.',
  'battle_result',
  '{"result": "3-0", "outcome": "win", "min_public_knowledge": 30}'::jsonb,
  'Take the spotlight',
  '{"public_knowledge": 20, "reputation": 0.3, "financial_stability": 0.5}'::jsonb,
  'Keep it low-key',
  '{"resilience": 0.2}'::jsonb
),

-- ==========================================
-- WIN STREAK EVENTS
-- ==========================================

(
  'WIN_STREAK_3',
  'Momentum Building',
  'Three wins in a row! You are on fire. A sponsor wants to back you financially.',
  'battle_result',
  '{"win_streak": 3}'::jsonb,
  'Sign the deal',
  '{"financial_stability": 1.0, "reputation": 0.3, "public_knowledge": 5}'::jsonb,
  'Stay independent',
  '{"reputation": 0.1, "resilience": 0.1}'::jsonb
),

(
  'WIN_STREAK_5',
  'Unstoppable Force',
  'Five straight wins! You are being called the next big thing. The pressure is mounting.',
  'battle_result',
  '{"win_streak": 5}'::jsonb,
  'Embrace the pressure',
  '{"reputation": 0.5, "public_knowledge": 15, "resilience": -0.2}'::jsonb,
  'Take a mental break',
  '{"resilience": 0.3, "reputation": -0.1}'::jsonb
),

-- ==========================================
-- CLOSE WIN EVENTS (2-1 wins)
-- ==========================================

(
  'CLOSE_VICTORY',
  'Controversial Decision',
  'You won 2-1, but some fans think the judges got it wrong. Social media is debating.',
  'battle_result',
  '{"result": "2-1", "outcome": "win"}'::jsonb,
  'Defend your performance',
  '{"public_knowledge": 10, "reputation": 0.1}'::jsonb,
  'Ignore the noise',
  '{"resilience": 0.2, "reputation": -0.1}'::jsonb
),

-- ==========================================
-- LOSS EVENTS (2-1 losses)
-- ==========================================

(
  'NARROW_LOSS',
  'Self-Doubt Creeping',
  'That 2-1 loss stings. You keep replaying it in your head, thinking about what you could have done differently.',
  'battle_result',
  '{"result": "2-1", "outcome": "loss"}'::jsonb,
  'Extra writing prep next battle',
  '{"prep_bonus_writing": 0.2, "resilience": -0.1}'::jsonb,
  'Take a mental break',
  '{"resilience": 0.2, "financial_stability": -0.1}'::jsonb
),

(
  'CONTROVERSIAL_LOSS',
  'Robbery Allegations',
  'You lost 2-1, but fans are saying you were robbed. The battle rap community is divided.',
  'battle_result',
  '{"result": "2-1", "outcome": "loss", "close_crowd_reaction": true}'::jsonb,
  'Call for a rematch',
  '{"reputation": 0.2, "public_knowledge": 15, "resilience": -0.1}'::jsonb,
  'Move on quietly',
  '{"resilience": 0.3, "reputation": -0.2}'::jsonb
),

-- ==========================================
-- CHOKE EVENTS
-- ==========================================

(
  'CHOKE_EVENT',
  'Confidence Shaken',
  'You choked in front of everyone. The crowd went silent. The doubt is real now.',
  'battle_result',
  '{"choked": true}'::jsonb,
  'Hire a performance coach',
  '{"financial_stability": -0.5, "resilience": 0.3, "stage_presence": 0.2}'::jsonb,
  'Push through alone',
  '{"resilience": -0.2, "reputation": -0.1}'::jsonb
),

(
  'CHOKE_IN_BIG_BATTLE',
  'Public Humiliation',
  'You choked in a high-profile battle. The memes are already circulating. This will haunt you.',
  'battle_result',
  '{"choked": true, "min_public_knowledge": 40}'::jsonb,
  'Own it and laugh it off',
  '{"public_knowledge": 10, "resilience": 0.2, "reputation": -0.1}'::jsonb,
  'Go into hiding',
  '{"resilience": -0.3, "public_knowledge": -5, "reputation": -0.3}'::jsonb
),

-- ==========================================
-- DOMINANT LOSS EVENTS (0-3 losses)
-- ==========================================

(
  'BAD_LOSS',
  'Rock Bottom',
  'You got destroyed 3-0. Everything you tried fell flat. Time to make a serious change.',
  'battle_result',
  '{"result": "3-0", "outcome": "loss"}'::jsonb,
  'Take a break from battles',
  '{"resilience": 0.5, "reputation": -0.3, "financial_stability": -0.2}'::jsonb,
  'Book immediate rematch',
  '{"resilience": -0.2, "reputation": 0.1, "prep_bonus_all": 0.1}'::jsonb
),

(
  'CAREER_CRISIS',
  'Is This Worth It?',
  'Another brutal loss. Your family is worried about you. Your bank account is suffering. Why are you even doing this?',
  'battle_result',
  '{"result": "3-0", "outcome": "loss", "max_financial_stability": 3}'::jsonb,
  'Find a day job',
  '{"financial_stability": 1.5, "resilience": 0.2, "prep_penalty": 0.1}'::jsonb,
  'Go all-in on battle rap',
  '{"financial_stability": -0.5, "resilience": 0.3, "reputation": 0.2}'::jsonb
),

-- ==========================================
-- PERSONAL EVENTS
-- ==========================================

(
  'FAMILY_WEDDING',
  'Family Wedding Invitation',
  'Your cousin is getting married the same week as your battle prep lock date. Family expects you there.',
  'battle_result',
  '{"any": true}'::jsonb,
  'Attend the wedding',
  '{"family_bond": 0.5, "prep_penalty": 0.2, "financial_stability": -0.1}'::jsonb,
  'Skip it, focus on battle',
  '{"family_bond": -0.5, "prep_bonus_all": 0.1, "resilience": -0.1}'::jsonb
),

(
  'FINANCIAL_CRISIS',
  'Bills Piling Up',
  'Rent is due and you are short. A lower-tier battle offers quick cash, but it could hurt your reputation.',
  'battle_result',
  '{"max_financial_stability": 3}'::jsonb,
  'Take the easy battle',
  '{"financial_stability": 0.5, "reputation": -0.2, "public_knowledge": -5}'::jsonb,
  'Grind it out',
  '{"financial_stability": -0.2, "resilience": 0.2}'::jsonb
),

(
  'MEDIA_INTERVIEW',
  'Media Spotlight',
  'A popular battle rap blog wants an exclusive interview about your career and recent performances.',
  'battle_result',
  '{"min_reputation": 7}'::jsonb,
  'Do the interview',
  '{"public_knowledge": 10, "reputation": 0.2}'::jsonb,
  'Decline, stay mysterious',
  '{"reputation": -0.1, "resilience": 0.1}'::jsonb
),

(
  'INJURY_MINOR',
  'Minor Voice Strain',
  'You strained your voice during practice. The battle is coming up soon. Do you rest or power through?',
  'battle_result',
  '{"any": true}'::jsonb,
  'Rest and recover',
  '{"resilience": 0.3, "prep_penalty": 0.1}'::jsonb,
  'Battle through it',
  '{"resilience": -0.2, "prep_bonus_performance": 0.1}'::jsonb
),

(
  'RIVAL_CALLOUT',
  'Public Callout',
  'An opponent you beat is calling you out on social media for a rematch. Everyone is watching your response.',
  'battle_result',
  '{"outcome": "win"}'::jsonb,
  'Accept the callout',
  '{"reputation": 0.3, "public_knowledge": 5}'::jsonb,
  'Ignore it',
  '{"reputation": -0.2, "resilience": 0.1}'::jsonb
),

(
  'TRAINING_PARTNER',
  'Training Partner Offer',
  'A respected veteran wants to train with you regularly. It will cost time and money, but could pay off.',
  'battle_result',
  '{"any": true}'::jsonb,
  'Accept the training',
  '{"financial_stability": -0.3, "lyricism": 0.2, "stage_presence": 0.2, "resilience": 0.1}'::jsonb,
  'Keep training solo',
  '{"resilience": 0.1}'::jsonb
),

(
  'VENUE_CHANGE',
  'Last-Minute Venue Change',
  'Your next battle venue changed to a much bigger room. The crowd will be huge. Are you ready for this?',
  'battle_result',
  '{"any": true}'::jsonb,
  'Embrace the opportunity',
  '{"public_knowledge": 10, "resilience": -0.2, "reputation": 0.2}'::jsonb,
  'Request smaller venue',
  '{"resilience": 0.2, "reputation": -0.1}'::jsonb
);

-- Ensure no duplicates on conflict
-- This allows re-running the migration safely
