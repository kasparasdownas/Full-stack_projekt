DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS waitlist_entries;
DROP TABLE IF EXISTS email_outbox;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    date_time TIMESTAMPTZ NOT NULL,
    venue VARCHAR(160) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
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
    seat_id UUID NOT NULL,
    booked_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_bookings_event_seat UNIQUE (event_id, seat_id)
);

CREATE TABLE waitlist_entries (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    event_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    notified_at TIMESTAMPTZ,
    CONSTRAINT uq_waitlist_user_event UNIQUE (user_id, event_id)
);

CREATE TABLE email_outbox (
    id UUID PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);
