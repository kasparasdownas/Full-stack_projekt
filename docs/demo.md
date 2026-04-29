# Demo Script

## Current Demo Flow

1. Open the landing page.
2. Register a new user or use a demo-account quick-fill button on the login page.
3. Show that `/api/auth/me` returns the authenticated profile.
4. Open the event list.
5. Open one event detail page.
6. Select multiple available seats from the cinema-style seat map.
7. Book the selected seats and show that they refresh into the booked state.
8. Open `My bookings` and show the reservation details.
9. Cancel the booking.
10. Return to the event page and show that the seat is available again.
11. Log out and show that the session returns to the landing page.
12. Open the events route again and show that the app redirects back to `Log in`.
13. For a sold-out event, join the waitlist and show it under `My waitlist`.
14. Optionally repeat from a second user session and show `Seat already booked`.

## Admin Demo Extension

1. Log in as `admin@example.com`.
2. Open `Admin events`.
3. Create an event with seat capacity `14`.
4. Edit the event, increase capacity, and show the new generated seats.
5. Unpublish, publish, and cancel an event to show lifecycle controls.
6. Attempt to delete an event with bookings or waitlist entries and show that it is blocked.
7. Book seats as a normal user.
8. Return as admin and open `View bookings` from the event detail page.
9. Show booked seats, waitlist entries, and user email in the admin bookings view.
10. Open `Email outbox` and show mock confirmation/cancellation/waitlist notification emails.

## Concurrency Demo

With the Compose stack running, execute:

```bash
node scripts/concurrency-demo.mjs
```

The script creates a one-seat event, sends simultaneous booking requests from Alice and Bob, and passes only when one request returns `201 Created` and the other returns `409 SEAT_ALREADY_BOOKED`.

## Course Verification Scripts

With the Compose stack running, execute:

```bash
node scripts/smoke-test.mjs
node scripts/measure-baseline.mjs
```

The smoke test proves the end-to-end admin/user flow: admin creates and edits an event, Alice books generated seats in a batch, Bob joins the waitlist, Alice cancels one booking, the seat becomes available again, a waitlist notification is recorded, and mock email evidence is visible.

The baseline script records frontend first-load and event API latency numbers for the CSR/SSR and operations discussion.

## Seeded Accounts

When demo seeding is enabled, the login page offers quick-fill buttons for:

- Admin: `admin@example.com` / `Admin123!`
- User: `alice@example.com` / `Password123!`
- User: `bob@example.com` / `Password123!`

## Talking Points

- client/server decomposition
- REST over JSON
- one shared PostgreSQL database
- modular service boundaries
- JWT cookie authentication
- CSRF protection for cookie-authenticated writes
- gateway security headers and login rate limiting
- logout via cookie clearing
- admin event lifecycle management with automatic seat generation and safe capacity changes
- admin event booking visibility
- waitlist visibility and mock email outbox evidence
- database-level concurrency guard actively preventing double booking
- runnable concurrency proof script
- Docker-based local deployment
- Debian 12 one-host deployment runbook
- CI running backend and frontend verification
- GraphQL intentionally excluded because REST fits the resource workflow
