-- Add metadata fields to life_event_templates for enhanced UI/UX

-- Add new columns to life_event_templates
ALTER TABLE life_event_templates
ADD COLUMN IF NOT EXISTS category text DEFAULT 'career' CHECK (category IN ('career', 'personal', 'scandal', 'financial', 'relationship')),
ADD COLUMN IF NOT EXISTS severity text DEFAULT 'moderate' CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
ADD COLUMN IF NOT EXISTS rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
ADD COLUMN IF NOT EXISTS icon_emoji text;

-- Add comment describing the new fields
COMMENT ON COLUMN life_event_templates.category IS 'Event category for UI theming and filtering (career, personal, scandal, financial, relationship)';
COMMENT ON COLUMN life_event_templates.severity IS 'Impact severity level (minor, moderate, major, critical)';
COMMENT ON COLUMN life_event_templates.rarity IS 'How rare/special this event is (common, uncommon, rare, epic, legendary)';
COMMENT ON COLUMN life_event_templates.icon_emoji IS 'Optional custom emoji icon for this event';

-- Update existing events with sensible defaults based on their type
UPDATE life_event_templates
SET category = 'career',
    severity = 'moderate'
WHERE category IS NULL;

-- Update specific events based on their code/title patterns
UPDATE life_event_templates
SET category = 'scandal',
    severity = 'major'
WHERE code LIKE '%scandal%' OR code LIKE '%controversy%';

UPDATE life_event_templates
SET category = 'financial',
    severity = 'moderate'
WHERE code LIKE '%money%' OR code LIKE '%deal%' OR code LIKE '%sponsor%';

UPDATE life_event_templates
SET category = 'personal',
    severity = 'minor'
WHERE code LIKE '%family%' OR code LIKE '%relationship%' OR code LIKE '%health%';

-- Win streaks and major achievements are career events with high severity
UPDATE life_event_templates
SET category = 'career',
    severity = 'major'
WHERE code LIKE '%streak%' OR code LIKE '%champion%' OR code LIKE '%breakthrough%';

-- Choke events are career setbacks
UPDATE life_event_templates
SET category = 'career',
    severity = 'major'
WHERE code LIKE '%choke%' OR code LIKE '%embarrass%';

-- Add index for faster filtering by category
CREATE INDEX IF NOT EXISTS idx_life_event_templates_category ON life_event_templates(category);
CREATE INDEX IF NOT EXISTS idx_life_event_templates_severity ON life_event_templates(severity);
