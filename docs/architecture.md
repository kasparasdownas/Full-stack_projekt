# Iteration 1 Architecture

## Architectural Summary

The system is implemented as a distributed client/server application with three backend services and one browser-based frontend:

- `auth-service` handles identity, registration, login, JWT cookie issuance, and current-user lookup
- `event-service` handles event catalogue reads and seat availability reads
- `booking-service` reserves the booking boundary for iteration 2 and owns the booking table plus the concurrency constraint
- `frontend` is a React CSR client that consumes REST APIs
- `nginx` acts as the single entry point for static frontend delivery and reverse proxying

This matches the course focus on client/server systems, SOA or microservice decomposition, REST communication, modularity, and deployability.

## Service Boundaries

### Auth Service

Responsibilities:

- register user accounts
- validate credentials
- issue JWT cookies
- return the authenticated user profile

Logical data ownership:

- `users`

### Event Service

Responsibilities:

- list events
- return event detail
- expose seat availability by joining seats with bookings read-only

Logical data ownership:

- `events`
- `seats`

### Booking Service

Responsibilities:

- own booking write boundary
- expose stub APIs for the next iteration
- enforce the shared-database seat uniqueness constraint through schema ownership

Logical data ownership:

- `bookings`

## Shared Database Strategy

Iteration 1 uses one PostgreSQL database because it is the safest course-project setup while still supporting service decomposition.

Important implementation note:

- The database schema is migrated centrally during auth-service startup in iteration 1.
- Table ownership is still logically documented per service even though the schema bootstrap is centralized.
- This decision keeps the empty repo bootstrap simple while preserving the intended service boundaries for later iterations.

## Concurrency Strategy

The system prevents double booking at the database level using:

- `UNIQUE (event_id, seat_id)` on the `bookings` table

The booking write API is postponed to iteration 2, but the concurrency mechanism is implemented now so the data model is already correct.

## API Style

The APIs use:

- JSON request and response bodies
- resource-based URIs
- standard HTTP verbs
- standard HTTP status codes
- OpenAPI documentation

This targets Richardson maturity model level 2:

- resources
- correct HTTP verbs
- HTTP status codes and headers

HATEOAS is deferred.

## Frontend Rendering Choice

Iteration 1 deliberately uses CSR with React and Vite:

- the core flow is authenticated and interaction-heavy
- SEO is not a primary requirement for the booking dashboard
- CSR gives faster delivery of a usable first vertical slice

SSR remains a possible later enhancement if public marketing pages become a requirement.

## Runtime Topology

### Local Development

- frontend dev server on `5173`
- auth-service on `8081`
- event-service on `8082`
- booking-service on `8083`

### Docker Deployment

- nginx gateway on `8080`
- auth-service behind nginx
- event-service behind nginx
- booking-service behind nginx
- postgres behind internal network

