-- Fix: Make template_code nullable for storyline chapters
-- Storyline chapters don't reference life_event_templates - they store data in details_json
-- and are linked via storyline_id + is_storyline_chapter

-- Drop the NOT NULL constraint and foreign key for storyline chapters
ALTER TABLE battler_life_events
ALTER COLUMN template_code DROP NOT NULL;

-- Add a check constraint to ensure either template_code OR is_storyline_chapter is set
-- This ensures data integrity: events must be either a template-based event or a storyline chapter
ALTER TABLE battler_life_events
ADD CONSTRAINT battler_life_events_template_or_storyline_check
CHECK (
  (template_code IS NOT NULL AND is_storyline_chapter = false)
  OR (is_storyline_chapter = true AND storyline_id IS NOT NULL)
);

COMMENT ON CONSTRAINT battler_life_events_template_or_storyline_check
  ON battler_life_events
  IS 'Events must either have a template_code (regular events) or be storyline chapters (is_storyline_chapter=true with storyline_id)';
