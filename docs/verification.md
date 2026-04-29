# Verification

## Automated Checks

### Backend

```bash
mvn -B test
```

Expected result:

- auth-service tests pass
- event-service tests pass
- booking-service tests pass
- Docker-backed Testcontainers tests run when Docker is available and skip automatically when unavailable

### Frontend

```bash
cd frontend
npm ci
npm test -- --run
npm run build
```

Expected result:

- component and hook tests pass
- production frontend build succeeds

### Script Syntax

```bash
node --check scripts/smoke-test.mjs
node --check scripts/concurrency-demo.mjs
node --check scripts/measure-baseline.mjs
```

## Live Stack Verification

Start the stack:

```bash
docker compose -f infrastructure/docker-compose.yml up --build -d
```

Run:

```bash
node scripts/smoke-test.mjs
node scripts/concurrency-demo.mjs
node scripts/measure-baseline.mjs
```

The smoke test proves the main admin/user booking loop. The concurrency demo proves the database unique constraint and transaction flow prevent double booking. The baseline script records the performance numbers requested by the CSR/SSR and operations course topics.

## CI

GitHub Actions runs on pushes and pull requests to `main`:

- backend job: Java 21 and `mvn -B test`
- frontend job: Node 22, `npm ci`, `npm test -- --run`, and `npm run build`

## Course Evidence Checklist

| Course topic | Evidence |
| --- | --- |
| Full-stack client/server | React frontend, nginx gateway, three Spring Boot services |
| JSON communication | JSON request/response contracts in `docs/api-contracts.md` |
| REST/Richardson level 2 | Resource URIs, HTTP verbs, status codes, OpenAPI docs |
| Security by design | FIPS-199 categorization, abuse cases, CSRF, bcrypt, roles, headers |
| Docker/container operation | Compose stack and Debian 12 runbook |
| Transactions/concurrency | `UNIQUE (event_id, seat_id)`, booking transaction, concurrency script |
| Testing | backend tests, frontend tests, smoke script, CI workflow |
| CSR/SSR decision | CSR rationale and baseline measurement script |
| GraphQL topic | documented decision to standardize on REST instead |

## Evidence to Capture on Debian VM

Paste final outputs into `docs/deployment-evidence.md`:

1. `docker --version`
2. `docker compose version`
3. `docker compose -f infrastructure/docker-compose.yml ps`
4. `node scripts/smoke-test.mjs`
5. `node scripts/concurrency-demo.mjs`
6. `node scripts/measure-baseline.mjs`
