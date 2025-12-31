-- Seed Storyline Templates
-- This seeds the 9 core storyline chain templates

-- FAMILY_DRAMA
INSERT INTO storyline_templates (code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings)
VALUES (
  'FAMILY_DRAMA',
  'Family Crisis',
  'Your family needs you. But your career is taking off...',
  'family',
  2, 5,
  '{"type": "random", "probability": 0.12, "conditions": {"min_battles": 5, "family_bond_max": 7}}'::jsonb,
  '[
    {"id": "family_ch1", "chapter_number": 1, "title": "The First Call", "description": "Your mom called. Something is wrong at home.", "delay": {"type": "immediate", "value": 0}, "urgency": "timed", "deadline_hours": 72, "prep_days_cost": 0, "choices": [{"id": "go_home", "label": "Go Home", "description": "Drop everything and go.", "effects": [{"type": "permanent", "family_bond": 1.5}, {"type": "temporary", "prep_days_lost": 3}], "leads_to": {"type": "ending", "id": "family_end_resolved_early"}}, {"id": "send_money", "label": "Send Money", "description": "Send support but stay focused.", "effects": [{"type": "permanent", "family_bond": -0.3}, {"type": "permanent", "financial_stability": -0.5}], "leads_to": {"type": "chapter", "id": "family_ch2"}}, {"id": "ignore", "label": "Focus on Career", "description": "They will understand...", "effects": [{"type": "permanent", "family_bond": -1.0}, {"type": "temporary", "stress": 15}], "leads_to": {"type": "chapter", "id": "family_ch3_crisis"}}]},
    {"id": "family_ch2", "chapter_number": 2, "title": "Things Getting Worse", "description": "The money helped, but they still need you.", "delay": {"type": "battles", "value": 2}, "urgency": "timed", "deadline_hours": 48, "prep_days_cost": 1, "choices": [{"id": "finally_go", "label": "Finally Go Home", "description": "You have put it off long enough.", "effects": [{"type": "permanent", "family_bond": 0.5}, {"type": "temporary", "prep_days_lost": 2}], "leads_to": {"type": "ending", "id": "family_end_resolved"}}, {"id": "keep_sending", "label": "Keep Sending Money", "description": "Maybe more money will help.", "effects": [{"type": "permanent", "family_bond": -0.5}, {"type": "permanent", "financial_stability": -1.0}], "leads_to": {"type": "ending", "id": "family_end_estranged"}}]},
    {"id": "family_ch3_crisis", "chapter_number": 3, "title": "The Fallout", "description": "Your family stopped calling. You hear through others that things got bad.", "delay": {"type": "battles", "value": 3}, "urgency": "passive", "prep_days_cost": 0, "choices": [{"id": "reach_out", "label": "Try to Reconnect", "description": "Swallow your pride and call.", "effects": [{"type": "permanent", "family_bond": 0.3}, {"type": "temporary", "stress": 20}], "leads_to": {"type": "ending", "id": "family_end_resolved"}}, {"id": "move_on", "label": "They Made Their Choice", "description": "Focus on what you can control.", "effects": [{"type": "permanent", "family_bond": -2.0}], "leads_to": {"type": "ending", "id": "family_end_estranged"}}]}
  ]'::jsonb,
  '[
    {"id": "family_end_resolved_early", "type": "positive", "title": "Family First", "description": "You dropped everything when it mattered. They will never forget that.", "effects": [{"type": "permanent", "family_bond": 1.0}, {"type": "temporary", "stress": -15, "duration_days": 30}], "badge": "Family First"},
    {"id": "family_end_resolved", "type": "positive", "title": "Better Late Than Never", "description": "It took a while, but you came through.", "effects": [{"type": "permanent", "family_bond": 0.5}]},
    {"id": "family_end_estranged", "type": "negative", "title": "Estranged", "description": "Your family has moved on without you.", "effects": [{"type": "permanent", "family_bond": -2.0}, {"type": "temporary", "stress": 25, "duration_days": 60}], "badge": "Forgot Where You Came From"}
  ]'::jsonb
);

-- LEGAL_TROUBLES
INSERT INTO storyline_templates (code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings)
VALUES (
  'LEGAL_TROUBLES',
  'Legal Troubles',
  'The past caught up with you. Now you are dealing with lawyers, courts, and consequences.',
  'legal',
  3, 6,
  '{"type": "random", "probability": 0.08, "conditions": {"min_battles": 8}}'::jsonb,
  '[
    {"id": "legal_ch1", "chapter_number": 1, "title": "The Summons", "description": "A process server showed up at your door. Someone is suing you.", "delay": {"type": "immediate", "value": 0}, "urgency": "timed", "deadline_hours": 96, "prep_days_cost": 1, "choices": [{"id": "get_lawyer", "label": "Hire a Lawyer", "description": "This is serious. Get professional help.", "effects": [{"type": "permanent", "financial_stability": -1.5}, {"type": "temporary", "stress": 10}], "leads_to": {"type": "chapter", "id": "legal_ch2"}}, {"id": "ignore_it", "label": "Ignore It", "description": "This is probably nothing.", "effects": [{"type": "temporary", "stress": 20}], "leads_to": {"type": "ending", "id": "legal_end_default"}}]},
    {"id": "legal_ch2", "chapter_number": 2, "title": "Discovery", "description": "Your lawyer says this could go either way.", "delay": {"type": "battles", "value": 2}, "urgency": "timed", "deadline_hours": 72, "prep_days_cost": 2, "choices": [{"id": "full_cooperation", "label": "Cooperate Fully", "description": "Give them everything.", "effects": [{"type": "temporary", "prep_days_lost": 2}, {"type": "temporary", "stress": 15}], "leads_to": {"type": "ending", "id": "legal_end_victory"}}, {"id": "fight_discovery", "label": "Fight Every Request", "description": "Make this difficult for them.", "effects": [{"type": "permanent", "financial_stability": -1.0}, {"type": "temporary", "stress": 25}], "leads_to": {"type": "ending", "id": "legal_end_partial"}}]}
  ]'::jsonb,
  '[
    {"id": "legal_end_victory", "type": "positive", "title": "Case Dismissed", "description": "You won. The judge threw out the case.", "effects": [{"type": "permanent", "reputation": 1.5}, {"type": "permanent", "resilience": 0.5}], "badge": "Beat the Case"},
    {"id": "legal_end_partial", "type": "neutral", "title": "Split Decision", "description": "You won on some counts, lost on others.", "effects": [{"type": "permanent", "financial_stability": -0.5}]},
    {"id": "legal_end_default", "type": "negative", "title": "Default Judgment", "description": "You did not show up. The court ruled against you.", "effects": [{"type": "permanent", "financial_stability": -3.0}, {"type": "permanent", "reputation": -1.5}]}
  ]'::jsonb
);

-- STREET_ALTERCATION
INSERT INTO storyline_templates (code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings)
VALUES (
  'STREET_ALTERCATION',
  'Street Altercation',
  'Someone got in your face after the battle. Now you have to decide how to handle it.',
  'street',
  2, 5,
  '{"type": "battle_result", "probability": 0.10, "conditions": {"min_battles": 3}}'::jsonb,
  '[
    {"id": "street_ch1", "chapter_number": 1, "title": "After the Battle", "description": "Someone stepped to you in the parking lot.", "delay": {"type": "immediate", "value": 0}, "urgency": "immediate", "prep_days_cost": 0, "choices": [{"id": "swing_first", "label": "Swing First", "description": "You are not about to let them think you are scared.", "effects": [{"type": "temporary", "stress": 30}], "leads_to": {"type": "chapter", "id": "street_ch2"}}, {"id": "talk_tough", "label": "Stand Your Ground", "description": "Keep it verbal but do not back down.", "effects": [{"type": "temporary", "stress": 15}, {"type": "permanent", "reputation": 0.3}], "leads_to": {"type": "ending", "id": "street_end_tension"}}, {"id": "walk_away", "label": "Walk Away", "description": "Not worth it.", "effects": [{"type": "permanent", "reputation": -0.5}], "leads_to": {"type": "ending", "id": "street_end_walked"}}]},
    {"id": "street_ch2", "chapter_number": 2, "title": "Hands Thrown", "description": "It is on. Security is coming but not here yet.", "delay": {"type": "immediate", "value": 0}, "urgency": "immediate", "prep_days_cost": 0, "choices": [{"id": "win_fight", "label": "Handle Your Business", "description": "Give them everything you got.", "effects": [{"type": "temporary", "stress": 20}], "leads_to": {"type": "ending", "id": "street_end_respect"}}, {"id": "get_caught", "label": "Security Breaks It Up", "description": "Security pulls you apart.", "effects": [{"type": "temporary", "stress": 25}, {"type": "permanent", "reputation": 0.2}], "leads_to": {"type": "ending", "id": "street_end_tension"}}]}
  ]'::jsonb,
  '[
    {"id": "street_end_walked", "type": "neutral", "title": "Cooler Heads", "description": "You walked away. Some respect it, some do not.", "effects": [{"type": "permanent", "reputation": -0.5}, {"type": "permanent", "resilience": 0.3}]},
    {"id": "street_end_tension", "type": "neutral", "title": "Unfinished Business", "description": "It is not over. Everyone knows it.", "effects": [{"type": "permanent", "reputation": 0.5}, {"type": "temporary", "stress": 10, "duration_days": 30}]},
    {"id": "street_end_respect", "type": "positive", "title": "Street Credibility", "description": "You handled yours. People know not to play with you.", "effects": [{"type": "permanent", "reputation": 1.5}, {"type": "permanent", "resilience": 0.5}], "badge": "About That Action"}
  ]'::jsonb
);

-- CREW_PRESSURE
INSERT INTO storyline_templates (code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings)
VALUES (
  'CREW_PRESSURE',
  'Crew Pressure',
  'Your old set is reaching out. They want you to rep.',
  'crew',
  3, 6,
  '{"type": "attribute", "probability": 0.10, "conditions": {"min_battles": 10, "reputation_min": 6}}'::jsonb,
  '[
    {"id": "crew_ch1", "chapter_number": 1, "title": "The Request", "description": "Big homie from back in the day hit you up.", "delay": {"type": "immediate", "value": 0}, "urgency": "timed", "deadline_hours": 168, "prep_days_cost": 0, "choices": [{"id": "rep_set", "label": "Rep the Set", "description": "They held you down before you had anything.", "effects": [{"type": "permanent", "crew_loyalty": 2.0}, {"type": "permanent", "reputation": 0.5}], "leads_to": {"type": "chapter", "id": "crew_ch2"}}, {"id": "keep_separate", "label": "Keep It Separate", "description": "Love the homies but can not mix these worlds.", "effects": [{"type": "permanent", "crew_loyalty": -1.0}, {"type": "temporary", "stress": 15}], "leads_to": {"type": "ending", "id": "crew_end_respect"}}]},
    {"id": "crew_ch2", "chapter_number": 2, "title": "Colors in the Ring", "description": "You showed up repping the set. Some leagues do not want that energy.", "delay": {"type": "battles", "value": 1}, "urgency": "passive", "prep_days_cost": 0, "choices": [{"id": "stay_repping", "label": "Keep Repping", "description": "This is who you are.", "effects": [{"type": "permanent", "crew_loyalty": 1.0}, {"type": "permanent", "reputation": -0.5}], "leads_to": {"type": "ending", "id": "crew_end_blacklisted"}}, {"id": "tone_down", "label": "Tone It Down", "description": "You made your point. Be strategic.", "effects": [{"type": "permanent", "crew_loyalty": -0.5}], "leads_to": {"type": "ending", "id": "crew_end_balanced"}}]}
  ]'::jsonb,
  '[
    {"id": "crew_end_balanced", "type": "positive", "title": "Best of Both Worlds", "description": "You found a balance.", "effects": [{"type": "permanent", "crew_loyalty": 0.5}, {"type": "permanent", "resilience": 0.3}]},
    {"id": "crew_end_respect", "type": "positive", "title": "Mutual Respect", "description": "They understood when you explained it.", "effects": [{"type": "permanent", "family_bond": 0.5}], "badge": "Kept It Real"},
    {"id": "crew_end_blacklisted", "type": "negative", "title": "League Blacklist", "description": "Major leagues will not book you.", "effects": [{"type": "permanent", "financial_stability": -2.0}, {"type": "permanent", "crew_loyalty": 2.0}], "badge": "Too Real For TV"}
  ]'::jsonb
);

-- FINANCIAL_HOLE
INSERT INTO storyline_templates (code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings)
VALUES (
  'FINANCIAL_HOLE',
  'Financial Crisis',
  'Money is getting tight. The battle checks are not covering what they used to.',
  'financial',
  2, 4,
  '{"type": "attribute", "probability": 0.15, "conditions": {"financial_stability_max": 4, "min_battles": 5}}'::jsonb,
  '[
    {"id": "financial_ch1", "chapter_number": 1, "title": "Bills Due", "description": "Rent is due and you are short.", "delay": {"type": "immediate", "value": 0}, "urgency": "timed", "deadline_hours": 72, "prep_days_cost": 0, "choices": [{"id": "take_quick_battle", "label": "Take a Quick Battle", "description": "Small room battle paying quick.", "effects": [{"type": "permanent", "financial_stability": 0.5}, {"type": "temporary", "prep_days_lost": 2}], "leads_to": {"type": "ending", "id": "financial_end_hustled"}}, {"id": "ask_for_advance", "label": "Ask for an Advance", "description": "See if they will front you.", "effects": [{"type": "permanent", "financial_stability": 0.3}, {"type": "permanent", "reputation": -0.3}], "leads_to": {"type": "ending", "id": "financial_end_debt"}}, {"id": "side_hustle", "label": "Find a Side Hustle", "description": "Pick up some other work.", "effects": [{"type": "permanent", "financial_stability": 1.0}, {"type": "temporary", "prep_days_lost": 4}], "leads_to": {"type": "ending", "id": "financial_end_grind"}}]}
  ]'::jsonb,
  '[
    {"id": "financial_end_hustled", "type": "neutral", "title": "Quick Money", "description": "You handled it. Took a battle below your level but the lights stayed on.", "effects": [{"type": "permanent", "resilience": 0.3}]},
    {"id": "financial_end_grind", "type": "neutral", "title": "Side Hustle Life", "description": "You got another source of income.", "effects": [{"type": "permanent", "financial_stability": 1.0}], "badge": "Two Jobs"},
    {"id": "financial_end_debt", "type": "negative", "title": "In Debt", "description": "You owe money to the league now.", "effects": [{"type": "permanent", "financial_stability": -0.5}, {"type": "temporary", "stress": 15, "duration_days": 30}]}
  ]'::jsonb
);

-- RIVALRY_BLOOD
INSERT INTO storyline_templates (code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings)
VALUES (
  'RIVALRY_BLOOD',
  'Blood Feud',
  'This opponent will not let it go. The beef is personal now.',
  'rivalry',
  3, 7,
  '{"type": "battle_result", "probability": 0.25, "conditions": {"same_opponent_losses": 1, "min_battles": 4}}'::jsonb,
  '[
    {"id": "rivalry_ch1", "chapter_number": 1, "title": "The Call Out", "description": "Your last opponent dropped a track calling you out.", "delay": {"type": "immediate", "value": 0}, "urgency": "timed", "deadline_hours": 96, "prep_days_cost": 0, "choices": [{"id": "respond_public", "label": "Respond Publicly", "description": "Fire back on social media.", "effects": [{"type": "permanent", "reputation": 0.5}, {"type": "temporary", "stress": 15}], "leads_to": {"type": "chapter", "id": "rivalry_ch2"}}, {"id": "ignore_callout", "label": "Ignore It", "description": "You are focused on bigger things.", "effects": [{"type": "permanent", "reputation": -0.3}], "leads_to": {"type": "ending", "id": "rivalry_end_quiet"}}, {"id": "accept_rematch", "label": "Accept the Rematch", "description": "You have got no reason to duck.", "effects": [{"type": "permanent", "reputation": 0.8}], "leads_to": {"type": "ending", "id": "rivalry_end_rematch"}}]},
    {"id": "rivalry_ch2", "chapter_number": 2, "title": "Social Media War", "description": "It is back and forth daily.", "delay": {"type": "days", "value": 7}, "urgency": "timed", "deadline_hours": 72, "prep_days_cost": 1, "choices": [{"id": "keep_going", "label": "Keep It Going", "description": "You are winning this war.", "effects": [{"type": "permanent", "reputation": 0.3}, {"type": "temporary", "stress": 20}], "leads_to": {"type": "ending", "id": "rivalry_end_viral"}}, {"id": "settle_in_ring", "label": "Settle It in the Ring", "description": "Challenge them to stop talking and battle.", "effects": [{"type": "permanent", "reputation": 0.5}], "leads_to": {"type": "ending", "id": "rivalry_end_rematch"}}]}
  ]'::jsonb,
  '[
    {"id": "rivalry_end_quiet", "type": "neutral", "title": "Let It Die", "description": "You ignored it and it faded away.", "effects": [{"type": "permanent", "reputation": -0.3}]},
    {"id": "rivalry_end_viral", "type": "positive", "title": "Viral Moment", "description": "The beef went viral. Everyone is watching.", "effects": [{"type": "permanent", "reputation": 1.0}]},
    {"id": "rivalry_end_rematch", "type": "positive", "title": "Rematch Booked", "description": "It is official. The stakes are higher than ever.", "effects": [{"type": "permanent", "reputation": 1.5}, {"type": "permanent", "resilience": 0.5}], "badge": "Main Event"}
  ]'::jsonb
);

-- HEALTH_CRISIS
INSERT INTO storyline_templates (code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings)
VALUES (
  'HEALTH_CRISIS',
  'Health Crisis',
  'Your body is telling you to slow down. Are you listening?',
  'health',
  2, 4,
  '{"type": "attribute", "probability": 0.12, "conditions": {"stress_min": 70, "min_battles": 10}}'::jsonb,
  '[
    {"id": "health_ch1", "chapter_number": 1, "title": "Warning Signs", "description": "You have been feeling off. Tired all the time.", "delay": {"type": "immediate", "value": 0}, "urgency": "passive", "prep_days_cost": 0, "choices": [{"id": "push_through", "label": "Push Through It", "description": "Rest is for the weak.", "effects": [{"type": "permanent", "resilience": -0.3}, {"type": "temporary", "stress": 15}], "leads_to": {"type": "ending", "id": "health_end_chronic"}}, {"id": "take_break", "label": "Take a Break", "description": "Cancel your next battle. Get some rest.", "effects": [{"type": "permanent", "reputation": -0.3}, {"type": "temporary", "prep_days_lost": 7}, {"type": "temporary", "stress": -30, "duration_days": 14}], "leads_to": {"type": "ending", "id": "health_end_recovered"}}, {"id": "see_doctor", "label": "See a Doctor", "description": "Get checked out.", "effects": [{"type": "permanent", "financial_stability": -0.5}, {"type": "temporary", "prep_days_lost": 2}], "leads_to": {"type": "ending", "id": "health_end_managed"}}]}
  ]'::jsonb,
  '[
    {"id": "health_end_recovered", "type": "positive", "title": "Smart Move", "description": "You took the break early. Came back fresh.", "effects": [{"type": "permanent", "resilience": 0.5}, {"type": "permanent", "preparation": 0.3}], "badge": "Know Your Limits"},
    {"id": "health_end_managed", "type": "neutral", "title": "Managing It", "description": "You are not 100% but you have learned to manage it.", "effects": [{"type": "permanent", "resilience": 0.3}]},
    {"id": "health_end_chronic", "type": "negative", "title": "Chronic Issues", "description": "You pushed too hard. Now you deal with this every day.", "effects": [{"type": "permanent", "resilience": -1.5}, {"type": "permanent", "preparation": -0.5}], "badge": "Battle Worn"}
  ]'::jsonb
);

-- CAREER_CROSSROADS
INSERT INTO storyline_templates (code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings)
VALUES (
  'CAREER_CROSSROADS',
  'Career Crossroads',
  'A big opportunity just landed. But every door you open might close another.',
  'career',
  3, 5,
  '{"type": "attribute", "probability": 0.10, "conditions": {"reputation_min": 7, "min_battles": 15}}'::jsonb,
  '[
    {"id": "career_ch1", "chapter_number": 1, "title": "The Offer", "description": "A music label reached out. They want to sign you.", "delay": {"type": "immediate", "value": 0}, "urgency": "timed", "deadline_hours": 168, "prep_days_cost": 0, "choices": [{"id": "hear_them_out", "label": "Hear Them Out", "description": "At least take the meeting.", "effects": [{"type": "temporary", "prep_days_lost": 1}], "leads_to": {"type": "chapter", "id": "career_ch2"}}, {"id": "decline_flat", "label": "Decline", "description": "Battle rap is your lane.", "effects": [{"type": "permanent", "reputation": 0.5}], "leads_to": {"type": "ending", "id": "career_end_stayed_true"}}]},
    {"id": "career_ch2", "chapter_number": 2, "title": "The Meeting", "description": "They flew you out. The deal is real.", "delay": {"type": "days", "value": 3}, "urgency": "timed", "deadline_hours": 96, "prep_days_cost": 2, "choices": [{"id": "sign_exclusive", "label": "Sign the Exclusive Deal", "description": "Life-changing money.", "effects": [{"type": "permanent", "financial_stability": 3.0}, {"type": "permanent", "reputation": -0.5}], "leads_to": {"type": "ending", "id": "career_end_signed"}}, {"id": "walk_away", "label": "Walk Away", "description": "The terms are not right.", "effects": [{"type": "permanent", "reputation": 0.8}], "leads_to": {"type": "ending", "id": "career_end_walked"}}]}
  ]'::jsonb,
  '[
    {"id": "career_end_stayed_true", "type": "positive", "title": "Stayed True", "description": "You turned down the money to stay in battles.", "effects": [{"type": "permanent", "reputation": 1.0}, {"type": "permanent", "resilience": 0.3}], "badge": "Battle Bred"},
    {"id": "career_end_signed", "type": "neutral", "title": "Signed", "description": "You signed an exclusive deal. Steady pay but limited options.", "effects": [{"type": "permanent", "financial_stability": 2.5}], "badge": "Signed and Sealed"},
    {"id": "career_end_walked", "type": "neutral", "title": "Walked Away", "description": "You walked away from bad terms.", "effects": [{"type": "permanent", "reputation": 0.5}]}
  ]'::jsonb
);

-- ROMANCE_TROUBLE
INSERT INTO storyline_templates (code, name, description, category, min_chapters, max_chapters, trigger_config, chapters, endings)
VALUES (
  'ROMANCE_TROUBLE',
  'Relationship Drama',
  'Your personal life is spilling into your professional one. Everyone is watching.',
  'romance',
  2, 5,
  '{"type": "random", "probability": 0.10, "conditions": {"min_battles": 6, "reputation_min": 5}}'::jsonb,
  '[
    {"id": "romance_ch1", "chapter_number": 1, "title": "The DM", "description": "Your partner found messages in your phone.", "delay": {"type": "immediate", "value": 0}, "urgency": "timed", "deadline_hours": 48, "prep_days_cost": 0, "choices": [{"id": "come_clean", "label": "Come Clean", "description": "Tell the truth. Whatever happens, happens.", "effects": [{"type": "permanent", "family_bond": -0.5}, {"type": "temporary", "stress": 25}], "leads_to": {"type": "ending", "id": "romance_end_working_on_it"}}, {"id": "deny_everything", "label": "Deny Everything", "description": "It was nothing. You can explain.", "effects": [{"type": "temporary", "stress": 15}], "leads_to": {"type": "chapter", "id": "romance_ch2"}}, {"id": "flip_it", "label": "Turn It Around", "description": "Why are they going through your phone?", "effects": [{"type": "permanent", "family_bond": -1.0}, {"type": "temporary", "stress": 20}], "leads_to": {"type": "ending", "id": "romance_end_toxic"}}]},
    {"id": "romance_ch2", "chapter_number": 2, "title": "More Receipts", "description": "They found more messages. Your story does not hold up.", "delay": {"type": "days", "value": 5}, "urgency": "immediate", "prep_days_cost": 0, "choices": [{"id": "confess_now", "label": "Confess Everything", "description": "Stop lying. Tell them everything.", "effects": [{"type": "permanent", "family_bond": -1.0}, {"type": "permanent", "reputation": -0.3}], "leads_to": {"type": "ending", "id": "romance_end_single"}}, {"id": "keep_denying", "label": "Keep Denying", "description": "Maybe they are bluffing.", "effects": [{"type": "temporary", "stress": 35}], "leads_to": {"type": "ending", "id": "romance_end_scandal"}}]}
  ]'::jsonb,
  '[
    {"id": "romance_end_working_on_it", "type": "neutral", "title": "Working On It", "description": "You are trying to make it work.", "effects": [{"type": "permanent", "family_bond": 0.5}, {"type": "temporary", "stress": 10, "duration_days": 30}]},
    {"id": "romance_end_single", "type": "neutral", "title": "Single", "description": "It is over. You are focusing on yourself.", "effects": [{"type": "permanent", "family_bond": -1.0}]},
    {"id": "romance_end_toxic", "type": "negative", "title": "Toxic Love", "description": "You stayed in a bad situation.", "effects": [{"type": "permanent", "resilience": -0.5}, {"type": "temporary", "stress": 25, "duration_days": 60}]},
    {"id": "romance_end_scandal", "type": "negative", "title": "Scandal", "description": "Your name is associated with drama now.", "effects": [{"type": "permanent", "reputation": -1.5}, {"type": "temporary", "stress": 35, "duration_days": 45}], "badge": "Drama King"}
  ]'::jsonb
);
