-- ═══════════════════════════════════════════════════════════════════════════
-- CREW LOYALTY + RECRUIT COOLDOWN
--
-- "Who put you in battle rap doesn't always stay as your manager."
-- Crew members have loyalty: it grows when the camp is winning, bleeds when
-- you lose, no-show, or stretch yourself managing too many. At zero, they
-- walk. Recruiting is rate-limited to one signing per week — a signature
-- should mean something.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS loyalty INTEGER NOT NULL DEFAULT 70
  CHECK (loyalty >= 0 AND loyalty <= 100);

-- Robust cooldown anchor (crew_members rows can be deleted by dismiss/leave)
ALTER TABLE battlers ADD COLUMN IF NOT EXISTS last_recruited_at TIMESTAMPTZ;

-- Backfill the anchor from existing crews
UPDATE battlers b
SET last_recruited_at = sub.latest
FROM (
  SELECT owner_battler_id, MAX(recruited_at) AS latest
  FROM crew_members
  GROUP BY owner_battler_id
) sub
WHERE b.id = sub.owner_battler_id
  AND b.last_recruited_at IS NULL;
