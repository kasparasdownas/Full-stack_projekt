# Distributed Event Booking System

A distributed full-stack event booking platform for the course `62595 Full stack development, operations and distributed systems`.

This repository implements:

- React + TypeScript frontend in CSR mode
- Spring Boot services for auth, events, and booking
- Shared PostgreSQL database
- JSON REST APIs with OpenAPI docs
- Nginx reverse proxy for one-origin deployment
- Security-by-design documentation, deployment notes, and smoke demo material

## Repository Layout

- `frontend` React CSR application
- `services/auth-service` registration, login, JWT cookie auth, profile endpoint
- `services/event-service` event list, event detail, seat availability read APIs
- `services/booking-service` booking creation, owned booking history, and owned cancellation APIs
- `infrastructure` nginx, compose, and deployment artifacts
- `docs` architecture, API, security, and demo documentation

## Current Scope

Delivered user flow:

1. register or log in
2. browse seeded demo events
3. open an event
4. view seat availability
5. book one available seat
6. review active bookings
7. cancel an owned booking
8. log out and clear the auth cookie

Still deferred:

- admin UI
- GraphQL
- multi-server deployment

## Service Ports

- Auth service: `8081`
- Event service: `8082`
- Booking service: `8083`
- Gateway: `8080`
- Frontend dev server: `5173`

## API Endpoints

Implemented:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/events`
- `GET /api/events/{eventId}`
- `GET /api/events/{eventId}/seats`
- `POST /api/bookings`
- `GET /api/users/me/bookings`
- `DELETE /api/bookings/{bookingId}`

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

The Vite dev server proxies `/api/auth`, `/api/events`, `/api/bookings`, and `/api/users/me/bookings` to the local backend services.

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

## Documentation

- [Architecture](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/architecture.md)
- [API Contracts](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/api-contracts.md)
- [Security By Design](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/security-by-design.md)
- [Deployment](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/deployment.md)
- [Demo Script](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/demo.md)
- [Postman Collection](/Users/km/Desktop/Desktop/Full-stack_projekt/docs/postman/iteration-1.postman_collection.json)
