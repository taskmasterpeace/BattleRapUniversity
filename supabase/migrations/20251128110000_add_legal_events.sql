/**
 * Add Legal/Court-Related Life Events
 *
 * Adds legal trouble events to the life events system:
 * - Contract disputes
 * - Lawsuits
 * - Court appearances
 * - Probation violations
 * - Restraining orders
 */

-- Legal Event Category: Contract Dispute
INSERT INTO event_definitions (
  code,
  name,
  category,
  base_trigger_probability,
  cooldown_battles,
  title,
  description,
  trigger_conditions,
  choices
) VALUES (
  'contract_dispute_legal',
  'Contract Dispute',
  'criminal', -- Existing category that fits legal issues
  0.12,
  10,
  'Legal Battle with Promoter',
  'A promoter is claiming you breached your contract by taking battles with other leagues. They''re threatening legal action and demanding compensation.',
  '{"required_badges": [], "badge_conditions": [], "attribute_thresholds": {}}'::jsonb,
  '[
    {
      "choice_text": "Lawyer up and fight it (Expensive)",
      "immediate_effects": {
        "financial_stability": -3,
        "stress": 15,
        "reputation": 1
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You hire a lawyer and prepare for a legal battle. It''s going to be expensive, but you''re not backing down."
    },
    {
      "choice_text": "Settle out of court (Cheaper but reputation hit)",
      "immediate_effects": {
        "financial_stability": -1,
        "stress": 5,
        "reputation": -2
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You agree to a settlement to avoid dragging this out. Word gets around that you folded under pressure."
    },
    {
      "choice_text": "Ignore it and hope it goes away",
      "immediate_effects": {
        "stress": 20,
        "reputation": -1
      },
      "karmic_debt": ["lawsuit_escalation"],
      "required_resources": {},
      "flavor_text": "You decide to ignore the threats. This might come back to bite you..."
    }
  ]'::jsonb
);

-- Legal Event: Copyright/Trademark Lawsuit
INSERT INTO event_definitions (
  code,
  name,
  category,
  base_trigger_probability,
  cooldown_battles,
  title,
  description,
  trigger_conditions,
  choices
) VALUES (
  'copyright_lawsuit',
  'Copyright Lawsuit',
  'criminal',
  0.08,
  15,
  'Cease and Desist',
  'You''ve been hit with a cease and desist letter. Someone claims you''re using their copyrighted material or brand name in your battles.',
  '{"required_badges": [], "badge_conditions": [], "attribute_thresholds": {}}'::jsonb,
  '[
    {
      "choice_text": "Change your name/branding immediately",
      "immediate_effects": {
        "reputation": -3,
        "stress": 10
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You rebrand to avoid legal trouble. Fans are confused and you lose momentum."
    },
    {
      "choice_text": "Fight the claim with a lawyer",
      "immediate_effects": {
        "financial_stability": -2,
        "stress": 15,
        "reputation": 2
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You stand your ground and fight the claim. Respect for not backing down, but it''s costly."
    },
    {
      "choice_text": "Pay the licensing fee",
      "immediate_effects": {
        "financial_stability": -2,
        "stress": 5
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You agree to pay for proper licensing. Expensive, but it keeps things moving."
    }
  ]'::jsonb
);

-- Legal Event: Restraining Order
INSERT INTO event_definitions (
  code,
  name,
  category,
  base_trigger_probability,
  cooldown_battles,
  title,
  description,
  trigger_conditions,
  choices
) VALUES (
  'restraining_order_beef',
  'Restraining Order',
  'betrayal',
  0.10,
  12,
  'Legal Beef Escalation',
  'Your beef with another battler has escalated. They''ve filed a restraining order claiming you''ve been threatening them. You can''t battle them or even be in the same venue.',
  '{"required_badges": ["Drama Starter"], "badge_conditions": ["or"], "attribute_thresholds": {}}'::jsonb,
  '[
    {
      "choice_text": "Comply and stay away",
      "immediate_effects": {
        "reputation": -2,
        "stress": 10
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You comply with the order. Some see it as weakness, others as maturity."
    },
    {
      "choice_text": "Violate it and show up anyway (Risky)",
      "immediate_effects": {
        "stress": 25,
        "reputation": 3
      },
      "karmic_debt": ["arrest_warrant"],
      "required_resources": {},
      "flavor_text": "You show up anyway. The crowd loves the drama, but you''re playing with fire."
    },
    {
      "choice_text": "Have your lawyer contest it",
      "immediate_effects": {
        "financial_stability": -2,
        "stress": 15
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You challenge the order through legal channels. It''s a long process."
    }
  ]'::jsonb
);

-- Legal Event: Civil Lawsuit for Defamation
INSERT INTO event_definitions (
  code,
  name,
  category,
  base_trigger_probability,
  cooldown_battles,
  title,
  description,
  trigger_conditions,
  choices
) VALUES (
  'defamation_lawsuit',
  'Defamation Lawsuit',
  'criminal',
  0.09,
  15,
  'Sued for Slander',
  'Someone you battled is suing you for defamation. They claim the personals you used were lies that damaged their reputation and career.',
  '{"required_badges": ["Personals Heavy"], "badge_conditions": ["or"], "attribute_thresholds": {}}'::jsonb,
  '[
    {
      "choice_text": "Prove everything you said was true",
      "immediate_effects": {
        "financial_stability": -2,
        "stress": 20,
        "reputation": 4
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You bring receipts. If you can prove it, you''ll be a legend. If not, you''re cooked."
    },
    {
      "choice_text": "Apologize and settle",
      "immediate_effects": {
        "financial_stability": -1,
        "reputation": -3,
        "stress": 5
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You issue a public apology and pay a settlement. Your reputation takes a major hit."
    },
    {
      "choice_text": "Countersue for frivolous lawsuit",
      "immediate_effects": {
        "financial_stability": -3,
        "stress": 25,
        "reputation": 2
      },
      "karmic_debt": ["legal_war"],
      "required_resources": {},
      "flavor_text": "You go on the offensive and countersue. This is about to get messy."
    }
  ]'::jsonb
);

-- Legal Event: Probation Violation
INSERT INTO event_definitions (
  code,
  name,
  category,
  base_trigger_probability,
  cooldown_battles,
  title,
  description,
  trigger_conditions,
  choices
) VALUES (
  'probation_violation',
  'Probation Violation',
  'criminal',
  0.11,
  10,
  'Violated Probation Terms',
  'You failed a drug test / missed a check-in / broke curfew while on probation. Your PO is threatening to violate you and send you back to court.',
  '{"required_badges": [], "badge_conditions": [], "attribute_thresholds": {}}'::jsonb,
  '[
    {
      "choice_text": "Turn yourself in and face the consequences",
      "immediate_effects": {
        "stress": 30,
        "reputation": 1
      },
      "karmic_debt": ["court_hearing_mandated"],
      "required_resources": {},
      "flavor_text": "You face the music. Respect for accountability, but this could derail everything."
    },
    {
      "choice_text": "Beg your PO for one more chance",
      "immediate_effects": {
        "reputation": -2,
        "stress": 20
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You grovel and promise to do better. Your PO agrees to give you one last shot."
    },
    {
      "choice_text": "Hire a lawyer to fight the violation",
      "immediate_effects": {
        "financial_stability": -3,
        "stress": 25
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You lawyer up to fight the violation. Expensive, but it might keep you out of jail."
    }
  ]'::jsonb
);

-- Legal Event: Court Summons / Hearing
INSERT INTO event_definitions (
  code,
  name,
  category,
  base_trigger_probability,
  cooldown_battles,
  title,
  description,
  trigger_conditions,
  choices
) VALUES (
  'court_summons_appearance',
  'Mandatory Court Appearance',
  'criminal',
  0.10,
  12,
  'Court Date Scheduled',
  'You''ve been summoned to court for an old case. Missing it means a warrant for your arrest. The hearing is the same day as a major battle.',
  '{"required_badges": [], "badge_conditions": [], "attribute_thresholds": {}}'::jsonb,
  '[
    {
      "choice_text": "Go to court, miss the battle",
      "immediate_effects": {
        "reputation": -2,
        "stress": 15,
        "financial_stability": -1
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "You handle your legal obligations. You lose the battle opportunity and the bag."
    },
    {
      "choice_text": "Battle and risk the warrant",
      "immediate_effects": {
        "stress": 35,
        "reputation": 2,
        "financial_stability": 1
      },
      "karmic_debt": ["arrest_warrant"],
      "required_resources": {},
      "flavor_text": "You show up for the battle. The crowd goes wild, but now you''re a fugitive."
    },
    {
      "choice_text": "Hire lawyer to get continuance",
      "immediate_effects": {
        "financial_stability": -2,
        "stress": 10
      },
      "karmic_debt": [],
      "required_resources": {},
      "flavor_text": "Your lawyer gets the court date moved. You can battle, but this is only a temporary fix."
    }
  ]'::jsonb
);

-- Summary
DO $$
BEGIN
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║             LEGAL EVENTS ADDED ✅                             ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '6 New Legal/Court Events Added:';
  RAISE NOTICE '  1. Contract Dispute (12%% probability)';
  RAISE NOTICE '  2. Copyright Lawsuit (8%% probability)';
  RAISE NOTICE '  3. Restraining Order (10%% probability)';
  RAISE NOTICE '  4. Defamation Lawsuit (9%% probability)';
  RAISE NOTICE '  5. Probation Violation (11%% probability)';
  RAISE NOTICE '  6. Mandatory Court Appearance (10%% probability)';
  RAISE NOTICE '';
  RAISE NOTICE 'Total Life Events: 18 (12 original + 6 legal)';
  RAISE NOTICE 'Players now face legal consequences for their actions!';
END $$;
