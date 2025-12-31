-- Add preparation attribute to personal stats
-- This migration adds the "preparation" field to all existing battler_attributes records

DO $$
DECLARE
  battler_record RECORD;
  updated_personal JSONB;
BEGIN
  FOR battler_record IN SELECT battler_id, personal FROM battler_attributes LOOP
    -- Add preparation field to personal stats (default value of 5 for existing battlers)
    updated_personal := battler_record.personal || jsonb_build_object('preparation', 5);

    UPDATE battler_attributes
    SET personal = updated_personal,
        updated_at = NOW()
    WHERE battler_id = battler_record.battler_id;
  END LOOP;
END $$;

-- Update seed data logic for future AI battlers
-- Update the comment to document the new field
COMMENT ON COLUMN battler_attributes.personal IS 'Personal attributes stored as JSONB: financial_stability (1-10), reputation (1-10), family_bond (1-10), preparation (1-10)';
