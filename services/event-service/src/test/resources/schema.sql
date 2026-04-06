DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS events;

CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    date_time TIMESTAMPTZ NOT NULL,
    venue VARCHAR(160) NOT NULL
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

