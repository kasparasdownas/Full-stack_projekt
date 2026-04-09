# Verification

## Completed locally

### Backend
- `auth-service` compiles successfully.
- `event-service` compiles successfully.
- `booking-service` compiles successfully.
- `auth-service` tests pass. Docker-backed integration tests are skipped automatically when Docker is unavailable.
- `event-service` tests pass. Docker-backed integration tests are skipped automatically when Docker is unavailable.
- `booking-service` tests pass. Docker-backed integration tests are skipped automatically when Docker is unavailable.

### Frontend
- `npm test` passes.
- `npm run build` passes.

## Commands used

### Java services
```bash
HOME=$PWD /tmp/apache-maven-3.9.9/bin/mvn -Dmaven.repo.local=$PWD/.m2 -pl services/auth-service test
HOME=$PWD /tmp/apache-maven-3.9.9/bin/mvn -Dmaven.repo.local=$PWD/.m2 -pl services/event-service test
HOME=$PWD /tmp/apache-maven-3.9.9/bin/mvn -Dmaven.repo.local=$PWD/.m2 -pl services/booking-service test
```

### Frontend
```bash
cd frontend
npm install
npm test
npm run build
```

## Not executed in this environment

- `docker compose up` smoke run was not executed because Docker is not installed in this environment.
- End-to-end browser validation through the reverse proxy is still pending for the first machine that has Docker available.
- API latency and frontend first-load baseline numbers are still pending for the first live Compose run.

## Compose smoke checklist

Run this once Docker is available:

1. Start the stack with `docker compose -f infrastructure/docker-compose.yml up --build`.
2. Open the frontend through the gateway on port `8080`.
3. Register a new user.
4. Log in and confirm `/api/auth/me` returns the logged-in user.
5. Open the events page and confirm demo events render.
6. Open one event and confirm seat availability renders.
7. Open Swagger for auth and event services and confirm documented contracts match responses.

## Baseline measurements to record

Record these on the first successful Docker smoke deployment:

| Metric | Method | Result |
| --- | --- | --- |
| Frontend first load time | Browser devtools, hard refresh on landing page | Pending |
| Event list API latency | `GET /api/events` through gateway | Pending |
| Event detail API latency | `GET /api/events/{id}` through gateway | Pending |
| Seat availability API latency | `GET /api/events/{id}/seats` through gateway | Pending |
