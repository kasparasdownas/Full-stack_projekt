# Security By Design

## Data Categorization

The current implementation uses a lightweight FIPS-199 style categorization.

| Asset | Confidentiality | Integrity | Availability | Notes |
| --- | --- | --- | --- | --- |
| User credentials and password hashes | Moderate | High | Moderate | Credentials must not leak and must not be modified |
| User profiles | Moderate | Moderate | Low | Basic PII |
| Booking records | Moderate | High | Moderate | Core transactional data |
| Admin actions and admin-created event content | Low | High | Moderate | Integrity matters more than secrecy |
| Public event catalogue | Low | Moderate | Low | Public but must be trustworthy |
| Seat availability data | Low | High | Moderate | Must remain accurate under concurrency |

## Abuse Cases

1. An attacker attempts credential stuffing against `POST /api/auth/login`.
2. An attacker sends malformed JSON or oversized values to crash validation or bypass assumptions.
3. An attacker tampers with identifiers to access data they should not access.
4. Two concurrent booking attempts target the same seat to force double booking.
5. An attacker attempts SQL injection through user-controlled inputs.
6. An attacker tries to read sensitive data from health or error endpoints.
7. An attacker steals a token from browser-accessible storage.
8. A misconfigured service uses database credentials broader than required.

## Selected Controls

- JWT authentication in HttpOnly cookies
- double-submit CSRF protection for unsafe cookie-authenticated requests
- bcrypt password hashing
- role-based authorization with `USER` and `ADMIN`
- server-side request validation on write endpoints
- least-privilege database user configuration via environment variables
- sanitized health endpoints only
- standardized error payloads with no stack traces
- one-origin gateway deployment through nginx
- gateway security headers including CSP, frame protection, nosniff, referrer policy, and permissions policy
- gateway login rate limiting with a JSON `429 RATE_LIMITED` response
- CORS allowlist for non-gateway development
- database-level unique constraint on `(event_id, seat_id)` in `bookings`
- transactional booking writes that validate event and seat ownership before insert

## Deferred Controls

The following are intentionally deferred to later iterations:

- refresh token rotation
- audit logging for admin actions
- dependency scanning in CI
