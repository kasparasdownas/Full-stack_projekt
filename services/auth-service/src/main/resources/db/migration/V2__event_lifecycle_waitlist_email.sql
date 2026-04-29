ALTER TABLE events
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

UPDATE events
SET status = 'PUBLISHED'
WHERE status IS NULL;

CREATE TABLE IF NOT EXISTS waitlist_entries (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMPTZ,
    CONSTRAINT uq_waitlist_user_event UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS email_outbox (
    id UUID PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_status_deleted_at ON events (status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_event_id ON waitlist_entries (event_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON waitlist_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_email_outbox_created_at ON email_outbox (created_at);
