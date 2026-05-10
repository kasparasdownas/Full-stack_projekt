# Deployment Evidence

This evidence is from a local Docker verification on macOS. It is not DTU-VM
evidence and should be replaced with Debian 12 VM output if the final delivery
must document the DTU deployment environment.

## Deployment Metadata

| Item | Value |
| --- | --- |
| Verification date/time | 2026-05-10 18:50 CEST |
| Verification type | Local Docker Compose |
| Host OS/version | macOS 26.4.1 |
| Gateway URL | `http://127.0.0.1:8091` |
| Compose project | `distributed-booking-evidence` |
| Git commit | `c1c9320` |

Note: port `8080` was already allocated locally, so the evidence stack was run
with `GATEWAY_PORT=8091`. The Compose file still defaults to `8080`.

## Runtime Versions

```bash
docker --version
docker compose version
node --version
```

```text
Docker version 29.3.1, build c2be9cc
Docker Compose version v5.1.1
v25.2.1
```

## Container State

```bash
env COMPOSE_PROJECT_NAME=distributed-booking-evidence GATEWAY_PORT=8091 \
  docker compose -f infrastructure/docker-compose.yml ps
```

```text
NAME                                             SERVICE           STATUS
distributed-booking-evidence-postgres-1          postgres          Up 2 minutes (healthy)
distributed-booking-evidence-auth-service-1      auth-service      Up About a minute (healthy)
distributed-booking-evidence-event-service-1     event-service     Up About a minute (healthy)
distributed-booking-evidence-booking-service-1   booking-service   Up About a minute (healthy)
distributed-booking-evidence-gateway-1           gateway           Up About a minute, 0.0.0.0:8091->8080/tcp
```

## Gateway Check

```bash
curl -i http://127.0.0.1:8091/api/events
```

```text
HTTP/1.1 401
Server: nginx/1.27.5
Content-Type: application/json;charset=ISO-8859-1

{"code":"UNAUTHORIZED","message":"Authentication is required","fieldErrors":[]}
```

The `401` response is expected without an authenticated session and confirms
that the gateway routes the request to the backend.

## Smoke Test

```bash
env BOOKING_BASE_URL=http://127.0.0.1:8091 node scripts/smoke-test.mjs
```

```text
Running smoke test against http://127.0.0.1:8091
Created event: Smoke Test Event 2026-05-10T18:50:50.315Z (e545b848-bd59-4838-b4ee-64d4d6689c06)
Batch booked seats: A01, A02, A03
Verified admin dashboard, capacity update, waitlist notification, blocked delete, and mock email outbox.
Result: smoke test passed.
```

## Double-Booking Proof

```bash
env BOOKING_BASE_URL=http://127.0.0.1:8091 node scripts/concurrency-demo.mjs
```

```text
Running concurrency demo against http://127.0.0.1:8091
Event: Concurrency Demo 2026-05-10T18:50:57.438Z (114333db-2753-4d13-97a8-da41a9059e45)
Seat: A01 (e8398297-059f-3ab4-a34f-aba0d7f754f2)
Alice: 409 SEAT_ALREADY_BOOKED
Bob: 201
Result: concurrency guard passed. Exactly one booking succeeded.
```

## Baseline Measurements

```bash
env BOOKING_BASE_URL=http://127.0.0.1:8091 node scripts/measure-baseline.mjs
```

| Metric | Method | Path | Status | Duration ms |
| --- | --- | --- | --- | --- |
| Frontend first load | GET | `/` | 200 | 36 |
| Event list API | GET | `/api/events` | 200 | 7 |
| Event detail API | GET | `/api/events/e545b848-bd59-4838-b4ee-64d4d6689c06` | 200 | 5 |
| Seat availability API | GET | `/api/events/e545b848-bd59-4838-b4ee-64d4d6689c06/seats` | 200 | 5 |
