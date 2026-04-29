# Deployment Notes

## Current Target

The required deployment proof is one Debian 12 VM running the containerized stack with Docker Compose.

Multi-server deployment remains deferred. The current target still demonstrates the course requirements for containerized deployment, operations, and a distributed client/server service topology.

## Services

- `gateway`: nginx static frontend and reverse proxy on port `8080`
- `auth-service`: registration, login, logout, CSRF bootstrap, and profile API
- `event-service`: event reads and admin event creation
- `booking-service`: booking writes, cancellation, user booking history, admin event booking visibility
- `postgres`: internal PostgreSQL database, not published to the host

## Debian 12 Runbook

1. Install Docker Engine and the Docker Compose plugin.

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

2. Clone or copy the repository to the VM.

```bash
git clone <repo-url>
cd Full-stack_projekt
```

3. Set deployment secrets before starting the stack.

```bash
export APP_JWT_SECRET="<at-least-32-characters-production-secret>"
export APP_AUTH_COOKIE_SECURE=false
export APP_ALLOWED_ORIGINS="http://<vm-host-or-ip>:8080"
```

4. Start the stack.

```bash
docker compose -f infrastructure/docker-compose.yml up --build -d
```

5. Inspect runtime state.

```bash
docker compose -f infrastructure/docker-compose.yml ps
docker compose -f infrastructure/docker-compose.yml logs --tail=100 gateway
docker compose -f infrastructure/docker-compose.yml logs --tail=100 auth-service
docker compose -f infrastructure/docker-compose.yml logs --tail=100 event-service
docker compose -f infrastructure/docker-compose.yml logs --tail=100 booking-service
```

6. Restart or stop the stack when needed.

```bash
docker compose -f infrastructure/docker-compose.yml restart
docker compose -f infrastructure/docker-compose.yml down
```

## Health and Smoke Verification

Run these from a machine that can reach the gateway.

```bash
curl -i http://localhost:8080/
node scripts/smoke-test.mjs
node scripts/concurrency-demo.mjs
node scripts/measure-baseline.mjs
```

If the VM is remote, set:

```bash
export BOOKING_BASE_URL="http://<vm-host-or-ip>:8080"
```

Expected results:

- frontend returns HTML through the gateway
- smoke test exits `0`
- concurrency demo exits `0` with exactly one `201` and one `409 SEAT_ALREADY_BOOKED`
- baseline script prints the latency table for frontend, event list, event detail, and seat availability

## Evidence

Copy the final VM proof into `docs/deployment-evidence.md`:

- deployment date/time
- VM OS/version
- `docker --version`
- `docker compose version`
- `docker compose ps`
- health/smoke outputs
- concurrency demo output
- baseline measurement table
