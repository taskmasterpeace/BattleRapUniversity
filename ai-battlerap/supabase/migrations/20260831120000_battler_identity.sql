-- Battler identity schema — the consistent-looks groundwork (owner, 2026-08-31).
-- Locks WHO a battler is so portrait generation stays consistent across
-- regenerations (and so league-culture fit can key off demographics + lane).
--
-- gender: presentation used by the portrait pipeline and copy.
-- identity jsonb (all optional, additive):
--   ethnicity        text  — e.g. "Black", "Latina", "White", "South Asian"
--   age_range        text  — "early 20s" | "late 20s" | "30s" | "40s"
--   build            text  — "slim" | "average" | "heavyset" | "athletic"
--   skin_tone        text  — prompt-ready ("deep brown", "tan", "pale")
--   hair             text  — style + color ("long box braids, black")
--   facial_hair      text  — "" for none
--   signature_look   text  — the clothing/accessory lock ("red leather jacket, gold hoops")
--   distinguishing   text  — scars, tattoos, glasses, chains
-- These strings are injected verbatim into the PixelLab prompt skeleton
-- (see .claude/skills/create-battler) so every regeneration matches.

ALTER TABLE battlers
  ADD COLUMN IF NOT EXISTS gender text
    CHECK (gender IN ('male', 'female', 'nonbinary')),
  ADD COLUMN IF NOT EXISTS identity jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN battlers.gender IS 'Presentation for portrait pipeline + copy (male/female/nonbinary)';
COMMENT ON COLUMN battlers.identity IS 'Appearance lock for consistent portrait generation: ethnicity, age_range, build, skin_tone, hair, facial_hair, signature_look, distinguishing';
