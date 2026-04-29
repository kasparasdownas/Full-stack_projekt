# Distributed Event Booking System

A distributed full-stack event booking platform for the course `62595 Full stack development, operations and distributed systems`.

This repository implements:

- React + TypeScript frontend in CSR mode
- Spring Boot services for auth, events, and booking
- Shared PostgreSQL database
- JSON REST APIs with OpenAPI docs
- Nginx reverse proxy for one-origin deployment
- Security-by-design controls, CI, deployment notes, and smoke demo material

## Repository Layout

- `frontend` React CSR application
- `services/auth-service` registration, login, JWT cookie auth, profile endpoint
- `services/event-service` event catalogue, seat lifecycle, admin event dashboard, event editing, status changes, and safe deletion
- `services/booking-service` single-seat and multi-seat booking, owned booking history, future-only cancellation, waitlist, admin booking visibility, and mock email outbox
- `infrastructure` nginx, compose, and deployment artifacts
- `docs` architecture, API, security, and demo documentation

## Current Scope

Delivered user flow:

1. register or log in
2. browse seeded demo events
3. open an event
4. view seat availability
5. select and book one or more available seats from the cinema-style seat map
6. review active bookings
7. cancel an owned future booking
8. join or leave a waitlist for sold-out events
9. log out and clear the auth cookie

Delivered admin flow:

1. log in as an `ADMIN`
2. create, edit, publish, unpublish, cancel, and safely delete events
3. generate and resize numbered seats from event capacity
4. view bookings and waitlist entries for a specific event
5. inspect the mock email outbox as demo evidence

Still deferred:

- multi-server deployment

GraphQL remains out of scope because the project standardizes on REST APIs.

## Service Ports

- Auth service: `8081`
- Event service: `8082`
- Booking service: `8083`
- Gateway: `8080`
- Frontend dev server: `5173`

## API Endpoints

Implemented:

- `POST /api/auth/register`
- `GET /api/auth/csrf`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/events`
- `POST /api/events`
- `GET /api/admin/events`
- `PUT /api/events/{eventId}`
- `POST /api/events/{eventId}/publish`
- `POST /api/events/{eventId}/unpublish`
- `POST /api/events/{eventId}/cancel`
- `DELETE /api/events/{eventId}`
- `GET /api/events/{eventId}`
- `GET /api/events/{eventId}/seats`
- `POST /api/bookings`
- `POST /api/bookings/batch`
- `GET /api/users/me/bookings`
- `DELETE /api/bookings/{bookingId}`
- `POST /api/events/{eventId}/waitlist`
- `DELETE /api/events/{eventId}/waitlist`
- `GET /api/users/me/waitlist`
- `GET /api/admin/events/{eventId}/bookings`
- `GET /api/admin/events/{eventId}/waitlist`
- `GET /api/admin/email-outbox`

## Prerequisites

- Java 21+
- Node.js 20+ or newer
- Maven 3.9+ for backend builds
- Docker and Docker Compose for the full local stack

## Frontend Development

From [`frontend`](/Users/km/Desktop/Desktop/Full-stack_projekt/frontend):

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api/auth`, `/api/events`, `/api/bookings`, `/api/users/me/bookings`, `/api/users/me/waitlist`, and admin booking/event routes to the local backend services.

## Backend Development

From the repository root:

```bash
mvn -pl services/auth-service spring-boot:run
mvn -pl services/event-service spring-boot:run
mvn -pl services/booking-service spring-boot:run
```

Run the auth service first because it applies the shared schema migrations for the shared database.

## Docker Compose

From [`infrastructure/docker-compose.yml`](/Users/km/Desktop/Desktop/Full-stack_projekt/infrastructure/docker-compose.yml):

```bash
docker compose -f infrastructure/docker-compose.yml up --build
```

The gateway serves the frontend and proxies API traffic to the backend services.

## Verification Scripts

With the Docker Compose stack running on port `8080`, run:

```bash
node scripts/smoke-test.mjs
node scripts/concurrency-demo.mjs
node scripts/measure-baseline.mjs
```

These scripts prove the main user/admin lifecycle flow, multi-seat booking, waitlist notification evidence, the database concurrency guard, and the baseline response times needed for the course verification notes.

## Concurrency Demo

With the Docker Compose stack running on port `8080`, run:

```bash
node scripts/concurrency-demo.mjs
```

The script creates a one-seat demo event, races Alice and Bob against the same seat, and exits successfully only when one request succeeds and the other receives `SEAT_ALREADY_BOOKED`.

## Documentation

- [Architecture](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/architecture.md)
- [API Contracts](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/api-contracts.md)
- [Security By Design](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/security-by-design.md)
- [Deployment](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/deployment.md)
- [Demo Script](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/demo.md)
- [Deployment Evidence](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/deployment-evidence.md)
- [Postman Collection](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/postman/distributed-booking-current.postman_collection.json)
