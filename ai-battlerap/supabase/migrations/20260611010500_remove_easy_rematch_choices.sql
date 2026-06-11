-- Rematches are special — they should only come through the rivalry system
-- (active rivalry with rematch_demand), not as a casual life-event choice the
-- day after any loss. Replace the generic loss-event rematch choices with
-- non-rematch alternatives. Effects stay comparable so balance is unchanged.

-- BAD_LOSS (3-0 loss): "Book immediate rematch" -> "Get back in the lab"
UPDATE life_event_templates
SET choice_b_text = 'Get back in the lab'
WHERE code = 'BAD_LOSS'
  AND choice_b_text = 'Book immediate rematch';

-- CONTROVERSIAL_LOSS (robbed 2-1): "Call for a rematch" -> speak out instead.
-- Rematch offers stay with the rivalry system's rematch_demand flow.
UPDATE life_event_templates
SET choice_a_text = 'Speak out about the robbery'
WHERE code = 'CONTROVERSIAL_LOSS'
  AND choice_a_text = 'Call for a rematch';
