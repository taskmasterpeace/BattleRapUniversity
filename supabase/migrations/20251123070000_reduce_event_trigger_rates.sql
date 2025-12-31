-- Reduce life event trigger probabilities to prevent player overwhelm
-- Based on game design analysis: current rates (25-50%) will trigger 1-2 events per battle
-- New rates (10-35%) create better pacing with max 1 event per battle cycle

-- First, add trigger_probability column if it doesn't exist
ALTER TABLE life_event_templates
ADD COLUMN IF NOT EXISTS trigger_probability numeric DEFAULT 0.25 CHECK (trigger_probability >= 0.0 AND trigger_probability <= 1.0);

-- Normal random events: 10% (down from 25%)
UPDATE life_event_templates
SET trigger_probability = 0.10
WHERE trigger_type = 'random';

-- Battle result events: 20% (down from higher values)
UPDATE life_event_templates
SET trigger_probability = 0.20
WHERE trigger_type = 'battle_result';

-- Time-based events: 15%
UPDATE life_event_templates
SET trigger_probability = 0.15
WHERE trigger_type = 'time';

-- Attribute-based events: 25%
UPDATE life_event_templates
SET trigger_probability = 0.25
WHERE trigger_type = 'attribute';
