-- Pressure moves (2026-08-31): battle_decisions now also logs the physical
-- chess match — pre-round pressure intents and resolved moves (talk-overs,
-- bumps, swings). They are round-scoped, not segment-scoped, so segment 0.
ALTER TABLE battle_decisions DROP CONSTRAINT IF EXISTS battle_decisions_decision_type_check;
ALTER TABLE battle_decisions ADD CONSTRAINT battle_decisions_decision_type_check CHECK (
  decision_type = ANY (ARRAY[
    'freestyle','rebuttal','speed_up','slow_down','volume_increase','emphasis_change',
    'flow_switch','repetition','accent_usage','gimmick','crowd_work','body_language_adjust',
    'facial_expression','stay_course',
    'pressure_intent','pressure_move'
  ]::text[])
);

ALTER TABLE battle_decisions DROP CONSTRAINT IF EXISTS battle_decisions_segment_number_check;
ALTER TABLE battle_decisions ADD CONSTRAINT battle_decisions_segment_number_check CHECK (
  segment_number >= 0 AND segment_number <= 6
);

-- A thrown punch voids the battle: 'no_contest' joins the verdict vocabulary.
ALTER TABLE battles DROP CONSTRAINT IF EXISTS battles_verdict_check;
ALTER TABLE battles ADD CONSTRAINT battles_verdict_check CHECK (
  verdict = ANY (ARRAY['3-0'::text, '2-1'::text, 'no_contest'::text])
);
