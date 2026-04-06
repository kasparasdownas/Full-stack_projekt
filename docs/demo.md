# Demo Script

## Iteration 1 Demo

1. Open the landing page.
2. Register a new user or log in with a seeded demo account.
3. Show that `/api/auth/me` returns the authenticated profile.
4. Open the event list.
5. Open one event detail page.
6. Show the seat availability list.
7. Explain that the booking table and unique seat constraint already exist even though booking is deferred to iteration 2.

## Seeded Accounts

When demo seeding is enabled:

- Admin: `admin@example.com` / `Admin123!`
- User: `alice@example.com` / `Password123!`
- User: `bob@example.com` / `Password123!`

## Talking Points

- client/server decomposition
- REST over JSON
- one shared PostgreSQL database
- modular service boundaries
- JWT cookie authentication
- database-level concurrency guard for future booking writes
- Docker-based local deployment

