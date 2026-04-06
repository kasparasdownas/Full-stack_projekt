DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR(160) NOT NULL
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

