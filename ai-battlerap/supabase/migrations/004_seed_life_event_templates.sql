-- Phase 6: Seed Life Event Templates
-- Defines common life events that can happen to battlers

insert into life_event_templates (code, category, base_publicity, base_reputation_delta, description)
values
  -- No-show events
  (
    'NO_SHOW_SMALL_ROOM',
    'scandal',
    60,
    -15,
    'No-showed a small room battle - moderate reputation damage'
  ),
  (
    'NO_SHOW_MAIN_STAGE',
    'scandal',
    90,
    -30,
    'No-showed a main stage battle - severe reputation damage'
  ),

  -- Choke events
  (
    'CHOKE_IN_BIG_BATTLE',
    'career',
    70,
    -10,
    'Choked in a high-profile battle'
  ),

  -- Dominant wins
  (
    'DOMINANT_30_BODYBAG',
    'career',
    80,
    15,
    'Delivered a dominant 3-0 bodybag performance'
  ),

  -- Upset victories
  (
    'UPSET_OF_THE_NIGHT',
    'career',
    85,
    20,
    'Pulled off a major upset against a higher-ranked opponent'
  ),

  -- Classic battles
  (
    'CLASSIC_BACK_AND_FORTH',
    'career',
    75,
    10,
    'Participated in an instant classic back-and-forth battle'
  ),

  -- Clear wins
  (
    'CLEAR_30_VICTORY',
    'career',
    60,
    10,
    'Won clearly with a 3-0 decision'
  ),

  -- Edge decisions
  (
    'NARROW_VICTORY',
    'career',
    50,
    5,
    'Won a close 2-1 decision'
  ),

  (
    'NARROW_LOSS',
    'career',
    50,
    -5,
    'Lost a close 2-1 decision'
  ),

  -- Comeback
  (
    'COMEBACK_VICTORY',
    'career',
    70,
    15,
    'Came back from a deficit to win the battle'
  )

on conflict (code) do nothing;
