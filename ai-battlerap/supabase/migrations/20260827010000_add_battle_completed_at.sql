-- Battles had no "when did this finish" timestamp. Surfaces that show completed
-- battles (the /watch "Just Happened" feed, the dossier, the calendar) fell back
-- to created_at or scheduled_at, so a battle CREATED long ago but COMPLETED
-- recently (e.g. a tournament bout played weeks after it was booked) showed a
-- stale "77D AGO" in a feed titled "Fresh Verdicts". Add a real completion time.
ALTER TABLE battles ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Backfill existing completed battles with created_at (best available proxy;
-- for seed/world battles created ≈ completed this is accurate). Going forward the
-- finalizers stamp the true completion time.
UPDATE battles SET completed_at = created_at
WHERE status = 'completed' AND completed_at IS NULL;
