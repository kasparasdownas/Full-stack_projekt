DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS waitlist_entries;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS events;

CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    date_time TIMESTAMPTZ NOT NULL,
    venue VARCHAR(160) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE seats (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL,
    seat_number VARCHAR(10) NOT NULL
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    event_id UUID NOT NULL,
    seat_id UUID NOT NULL
);

CREATE TABLE waitlist_entries (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    event_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMPTZ,
    CONSTRAINT uq_waitlist_user_event UNIQUE (user_id, event_id)
);
