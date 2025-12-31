-- Seed the CAREER_EXPOSED storyline template

INSERT INTO storyline_templates (
  code,
  name,
  description,
  category,
  min_chapters,
  max_chapters,
  trigger_config,
  chapters,
  endings
)
SELECT
  'CAREER_EXPOSED',
  'The Secret''s Out',
  'Someone''s been digging into your history. How long you''ve really been in this game is about to become public knowledge.',
  'career',
  2,
  4,
  '{
    "type": "compound",
    "probability": 0.25,
    "conditions": {
      "all": [
        { "career_is_hidden": true },
        { "min_battles": 12 },
        {
          "any": [
            { "min_tier": "rising" },
            { "min_attribute": { "reputation": 5 } },
            { "has_recent_big_win": true }
          ]
        }
      ]
    }
  }'::jsonb,
  '[
    {
      "id": "exposed_ch1",
      "chapter_number": 1,
      "title": "Someone''s Asking Questions",
      "description": "A blogger reached out. They''re doing a profile piece on you. They want to know your story - when you started, where you came from, how long you''ve been in the game. They''ve already been asking around.",
      "delay": { "type": "immediate", "value": 0 },
      "urgency": "timed",
      "deadline_hours": 72,
      "prep_days_cost": 0,
      "choices": [
        {
          "id": "control_narrative",
          "label": "Control the Story",
          "description": "Sit down with them. Tell your story your way. They''ll learn how long you''ve been in, but at least you frame it.",
          "effects": [
            { "type": "permanent", "reputation": 0.5 },
            { "type": "special", "reveal_career": true, "reveal_method": "self" }
          ],
          "leads_to": { "type": "chapter", "id": "exposed_ch2_owned" }
        },
        {
          "id": "deflect",
          "label": "Dodge the Questions",
          "description": "Be vague. Give them enough for a story but nothing concrete about your timeline.",
          "effects": [{ "type": "temporary", "stress": 15 }],
          "leads_to": { "type": "chapter", "id": "exposed_ch2_evasive" }
        },
        {
          "id": "refuse",
          "label": "No Comment",
          "description": "Tell them you don''t do interviews. Let them write whatever they want.",
          "effects": [
            { "type": "permanent", "reputation": -0.3 },
            { "type": "temporary", "stress": 20 }
          ],
          "leads_to": { "type": "chapter", "id": "exposed_ch2_hostile" }
        }
      ]
    },
    {
      "id": "exposed_ch2_owned",
      "chapter_number": 2,
      "title": "The Profile Drops",
      "description": "The article''s out. It tells your real story - how long you''ve been grinding, where you started, the journey.",
      "delay": { "type": "days", "value": 7 },
      "urgency": "passive",
      "prep_days_cost": 0,
      "choices": [
        {
          "id": "embrace_underdog",
          "label": "Embrace the Underdog Story",
          "description": "Lean into it. ''Yeah I''m new. And I''m already here.''",
          "effects": [
            { "type": "permanent", "resilience": 0.3 },
            { "type": "permanent", "reputation": 0.5 }
          ],
          "leads_to": { "type": "ending", "id": "exposed_end_underdog" }
        },
        {
          "id": "prove_experience",
          "label": "Show Your Maturity",
          "description": "The timeline doesn''t matter. Your skill does. Keep proving that.",
          "effects": [{ "type": "permanent", "reputation": 0.3 }],
          "leads_to": { "type": "ending", "id": "exposed_end_respect" }
        }
      ]
    },
    {
      "id": "exposed_ch2_evasive",
      "chapter_number": 2,
      "title": "They Found Out Anyway",
      "description": "The blogger dug deeper. Now they''re running ''The Mystery Behind [Your Name]''.",
      "delay": { "type": "days", "value": 5 },
      "urgency": "timed",
      "deadline_hours": 48,
      "prep_days_cost": 1,
      "choices": [
        {
          "id": "come_clean_late",
          "label": "Set the Record Straight",
          "description": "Post your own statement.",
          "effects": [
            { "type": "permanent", "reputation": -0.2 },
            { "type": "special", "reveal_career": true, "reveal_method": "media" }
          ],
          "leads_to": { "type": "chapter", "id": "exposed_ch3_damage_control" }
        },
        {
          "id": "attack_blogger",
          "label": "Go After the Blogger",
          "description": "Call them out for invading your privacy.",
          "effects": [
            { "type": "permanent", "reputation": -0.5 },
            { "type": "temporary", "stress": 25 }
          ],
          "leads_to": { "type": "chapter", "id": "exposed_ch3_conflict" }
        }
      ]
    },
    {
      "id": "exposed_ch2_hostile",
      "chapter_number": 2,
      "title": "The Hit Piece",
      "description": "The blogger didn''t appreciate being stonewalled. The article questions everything.",
      "delay": { "type": "days", "value": 3 },
      "urgency": "timed",
      "deadline_hours": 48,
      "prep_days_cost": 0,
      "choices": [
        {
          "id": "respond_fire",
          "label": "Respond With Fire",
          "description": "Clap back publicly.",
          "effects": [
            { "type": "permanent", "reputation": 0.3 },
            { "type": "temporary", "stress": 30 },
            { "type": "special", "reveal_career": true, "reveal_method": "media" }
          ],
          "leads_to": { "type": "chapter", "id": "exposed_ch3_beef" }
        },
        {
          "id": "ignore_haters",
          "label": "Ignore It",
          "description": "Don''t engage. Let it die.",
          "effects": [
            { "type": "permanent", "reputation": -0.5 },
            { "type": "special", "reveal_career": true, "reveal_method": "media" }
          ],
          "leads_to": { "type": "ending", "id": "exposed_end_unbothered" }
        }
      ]
    },
    {
      "id": "exposed_ch3_damage_control",
      "chapter_number": 3,
      "title": "The Narrative Shifts",
      "description": "Your statement helped. People understand why you kept it private.",
      "delay": { "type": "days", "value": 3 },
      "urgency": "passive",
      "prep_days_cost": 0,
      "choices": [
        {
          "id": "turn_into_motivation",
          "label": "Use It As Fuel",
          "description": "Let it motivate your next battle.",
          "effects": [
            { "type": "temporary", "prep_efficiency_modifier": 1.2, "duration_battles": 2 },
            { "type": "permanent", "resilience": 0.3 }
          ],
          "leads_to": { "type": "ending", "id": "exposed_end_motivated" }
        },
        {
          "id": "move_past",
          "label": "Move Past It",
          "description": "Nothing left to hide. Just keep working.",
          "effects": [{ "type": "permanent", "reputation": 0.2 }],
          "leads_to": { "type": "ending", "id": "exposed_end_fresh_start" }
        }
      ]
    },
    {
      "id": "exposed_ch3_conflict",
      "chapter_number": 3,
      "title": "Blogger Beef",
      "description": "The blogger''s clapping back with receipts.",
      "delay": { "type": "days", "value": 3 },
      "urgency": "timed",
      "deadline_hours": 48,
      "prep_days_cost": 1,
      "choices": [
        {
          "id": "end_it",
          "label": "End the Beef",
          "description": "It''s not worth it.",
          "effects": [
            { "type": "permanent", "reputation": -0.3 },
            { "type": "special", "reveal_career": true, "reveal_method": "media" }
          ],
          "leads_to": { "type": "ending", "id": "exposed_end_peace" }
        },
        {
          "id": "escalate",
          "label": "Escalate",
          "description": "You''re not backing down.",
          "effects": [
            { "type": "temporary", "stress": 35 },
            { "type": "permanent", "reputation": 0.5 },
            { "type": "special", "reveal_career": true, "reveal_method": "opponent" }
          ],
          "leads_to": { "type": "ending", "id": "exposed_end_war" }
        }
      ]
    },
    {
      "id": "exposed_ch3_beef",
      "chapter_number": 3,
      "title": "Battle Lines Drawn",
      "description": "Your response got attention. The conversation shifted to your realness.",
      "delay": { "type": "days", "value": 5 },
      "urgency": "passive",
      "prep_days_cost": 0,
      "choices": [
        {
          "id": "win_with_performance",
          "label": "Let the Next Battle Speak",
          "description": "End the debate by performing.",
          "effects": [
            { "type": "temporary", "stress": 25 },
            { "type": "temporary", "prep_efficiency_modifier": 1.3, "duration_battles": 1 }
          ],
          "leads_to": { "type": "ending", "id": "exposed_end_statement" }
        },
        {
          "id": "continue_war",
          "label": "Keep the Smoke",
          "description": "This beef is good publicity.",
          "effects": [
            { "type": "permanent", "reputation": 0.3 },
            { "type": "temporary", "stress": 30 }
          ],
          "leads_to": { "type": "ending", "id": "exposed_end_notorious" }
        }
      ]
    }
  ]'::jsonb,
  '[
    {
      "id": "exposed_end_underdog",
      "type": "positive",
      "title": "The Underdog",
      "description": "Your career length is public knowledge now, but the story is positive. You''re the underdog who rose fast.",
      "effects": [
        { "type": "permanent", "reputation": 1.0 },
        { "type": "permanent", "resilience": 0.5 }
      ],
      "badge": "Rapid Rise"
    },
    {
      "id": "exposed_end_respect",
      "type": "positive",
      "title": "Earned Respect",
      "description": "Nobody cares about your timeline anymore. Your skill speaks for itself.",
      "effects": [{ "type": "permanent", "reputation": 0.8 }]
    },
    {
      "id": "exposed_end_motivated",
      "type": "positive",
      "title": "Motivated",
      "description": "The exposure lit a fire. You''re training harder.",
      "effects": [
        { "type": "permanent", "resilience": 0.5 },
        { "type": "temporary", "prep_efficiency_modifier": 1.15, "duration_days": 30 }
      ]
    },
    {
      "id": "exposed_end_fresh_start",
      "type": "positive",
      "title": "Fresh Start",
      "description": "No more secrets. The pressure of keeping it hidden is gone.",
      "effects": [
        { "type": "permanent", "reputation": 0.3 },
        { "type": "temporary", "stress": -15, "duration_days": 14 }
      ]
    },
    {
      "id": "exposed_end_unbothered",
      "type": "neutral",
      "title": "Unbothered",
      "description": "You didn''t engage with the drama.",
      "effects": [{ "type": "permanent", "resilience": 0.3 }]
    },
    {
      "id": "exposed_end_peace",
      "type": "neutral",
      "title": "Peace Made",
      "description": "You ended the beef before it got ugly.",
      "effects": [{ "type": "temporary", "stress": -10, "duration_days": 7 }]
    },
    {
      "id": "exposed_end_statement",
      "type": "positive",
      "title": "Statement Performance",
      "description": "You let your battle speak. The haters are quiet now.",
      "effects": [
        { "type": "permanent", "reputation": 1.0 },
        { "type": "permanent", "resilience": 0.5 }
      ],
      "badge": "Proving Grounds"
    },
    {
      "id": "exposed_end_notorious",
      "type": "neutral",
      "title": "Notorious",
      "description": "You''re known for the beef now.",
      "effects": [
        { "type": "permanent", "reputation": 0.5 },
        { "type": "permanent", "resilience": -0.2 }
      ]
    },
    {
      "id": "exposed_end_war",
      "type": "negative",
      "title": "At War",
      "description": "You''re in a full-blown beef with media now. It''s affecting your bookings.",
      "effects": [
        { "type": "permanent", "reputation": -0.5 },
        { "type": "temporary", "stress": 30, "duration_days": 30 }
      ],
      "badge": "Media Enemy"
    }
  ]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM storyline_templates WHERE code = 'CAREER_EXPOSED'
);
