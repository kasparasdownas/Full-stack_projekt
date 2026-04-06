# Deployment Notes

## Iteration 1 Target

Iteration 1 targets:

- local development with separate service processes
- one-host deployment on Debian 12 using containers

Multi-server deployment is postponed to iteration 2.

## Services

- `gateway` nginx static frontend and reverse proxy
- `auth-service`
- `event-service`
- `booking-service`
- `postgres`

## Environment Variables

Each service expects environment variables for:

- database URL
- database username
- database password
- JWT secret
- cookie security flags
- optional origin allowlist
- demo-data seeding switch

See service-specific `application.yml` files and the compose file for defaults.

## Debian 12 Smoke Deployment

1. Install Docker Engine and Docker Compose plugin.
2. Copy the repository to the server.
3. Set production environment variables.
4. Run:

```bash
docker compose -f infrastructure/docker-compose.yml up --build -d
```

5. Verify:

- `GET /actuator/health` on the backend services
- `GET /api/events` through the gateway after authenticating
- frontend landing page through the gateway

## Iteration 1 Runtime Notes

- The auth service applies the shared schema migrations during startup.
- The event service seeds events and seats when demo data is enabled.
- The booking service exposes only stubs in iteration 1 but owns the booking boundary for iteration 2.

