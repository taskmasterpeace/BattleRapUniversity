-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'battle_offer',
  'battle_complete',
  'life_event',
  'badge_earned',
  'level_up',
  'tournament_update',
  'system_message'
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battler_id UUID REFERENCES battlers(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,

  -- Ensure metadata is valid JSON
  CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

-- Create indexes for efficient queries
CREATE INDEX idx_notifications_battler ON notifications(battler_id);
CREATE INDEX idx_notifications_unread ON notifications(battler_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(battler_id, type);

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_battler_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (battler_id, type, title, message, metadata)
  VALUES (p_battler_id, p_type, p_title, p_message, p_metadata)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_battler_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id
    AND battler_id = p_battler_id
    AND is_read = FALSE
  RETURNING TRUE INTO v_updated;

  RETURN COALESCE(v_updated, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read for a battler
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_battler_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE battler_id = p_battler_id
    AND is_read = FALSE
  RETURNING count(*) INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get unread count for a battler
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_battler_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE battler_id = p_battler_id
    AND is_read = FALSE;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old read notifications (keep last 100 per battler)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE id IN (
    SELECT id
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY battler_id ORDER BY created_at DESC) as rn
      FROM notifications
      WHERE is_read = TRUE
    ) subquery
    WHERE rn > 100
  );
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE notifications IS 'Stores in-game notifications for players about battles, events, achievements, etc.';
COMMENT ON FUNCTION create_notification IS 'Creates a new notification for a battler';
COMMENT ON FUNCTION mark_notification_read IS 'Marks a single notification as read';
COMMENT ON FUNCTION mark_all_notifications_read IS 'Marks all unread notifications as read for a battler';
COMMENT ON FUNCTION get_unread_notification_count IS 'Returns count of unread notifications for a battler';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Removes old read notifications, keeping last 100 per battler';
