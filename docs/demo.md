# Demo Script

## Current Demo Flow

1. Open the landing page.
2. Register a new user or use a demo-account quick-fill button on the login page.
3. Show that `/api/auth/me` returns the authenticated profile.
4. Open the event list.
5. Open one event detail page.
6. Book one available seat from the seat list.
7. Show that the seat refreshes into the booked state.
8. Open `My bookings` and show the reservation details.
9. Cancel the booking.
10. Return to the event page and show that the seat is available again.
11. Log out and show that the session returns to the landing page.
12. Open the events route again and show that the app redirects back to `Log in`.
13. Optionally repeat from a second user session and show `Seat already booked`.

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
- logout via cookie clearing
- database-level concurrency guard actively preventing double booking
- Docker-based local deployment
