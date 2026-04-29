# Deployment Evidence

Use this document to paste the final Debian 12 VM proof for the report and presentation.

## Deployment Metadata

| Item | Value |
| --- | --- |
| Deployment date/time | Pending |
| VM OS/version | Pending |
| Public/internal URL | Pending |
| Git commit | Pending |

## Runtime Versions

```bash
docker --version
docker compose version
node --version
```

Paste output here:

```text
Pending
```

## Container State

```bash
docker compose -f infrastructure/docker-compose.yml ps
```

Paste output here:

```text
Pending
```

## Gateway and Health Checks

```bash
curl -i http://localhost:8080/
docker compose -f infrastructure/docker-compose.yml logs --tail=50 auth-service
docker compose -f infrastructure/docker-compose.yml logs --tail=50 event-service
docker compose -f infrastructure/docker-compose.yml logs --tail=50 booking-service
```

Paste relevant output here:

```text
Pending
```

## Smoke Test

```bash
node scripts/smoke-test.mjs
```

Paste output here:

```text
Pending
```

## Concurrency Proof

```bash
node scripts/concurrency-demo.mjs
```

Paste output here:

```text
Pending
```

## Baseline Measurements

```bash
node scripts/measure-baseline.mjs
```

| Metric | Method | Path | Status | Duration ms |
| --- | --- | --- | --- | --- |
| Frontend first load | GET | `/` | Pending | Pending |
| Event list API | GET | `/api/events` | Pending | Pending |
| Event detail API | GET | `/api/events/{id}` | Pending | Pending |
| Seat availability API | GET | `/api/events/{id}/seats` | Pending | Pending |
