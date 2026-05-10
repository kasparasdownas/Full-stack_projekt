# Distributed Event Booking System

Dette er et full-stack event-bookingsystem lavet til kurset `62595 Full stack development, operations and distributed systems`.

Systemet kan køres direkte med Docker og indeholder både frontend, backend-services, database og gateway.

## Quick Start

Den nemmeste måde at køre projektet på er med Docker. Man behøver ikke installere Java, Maven, Node eller PostgreSQL separat, hvis man bare vil starte hele systemet.

Åbn en terminal i projektmappen og kør:

```bash
docker compose -f infrastructure/docker-compose.yml up --build
```

Åbn derefter:

```text
http://localhost:8080
```

Demo-login:

```text
Admin:
admin@example.com / Admin123!

Brugere:
alice@example.com / Password123!
bob@example.com / Password123!
```

Hvis port `8080` allerede bruges af et andet program, kan projektet startes på en anden port, for eksempel `3000`:

```bash
GATEWAY_PORT=3000 docker compose -f infrastructure/docker-compose.yml up --build
```

Åbn så:

```text
http://localhost:3000
```

Stop projektet igen med:

```bash
docker compose -f infrastructure/docker-compose.yml down
```

## Hvad Projektet Indeholder

Projektet består af:

- en React-frontend skrevet i TypeScript
- tre Spring Boot-services til login, events og bookinger
- en PostgreSQL-database
- en Nginx-gateway, så hele appen kan åbnes fra én adresse
- REST API’er med JSON
- Docker Compose til at starte hele systemet samlet
- test- og demo-scripts til at vise de vigtigste flows

## Mappestruktur

- `frontend` indeholder React-applikationen
- `services/auth-service` håndterer registrering, login, logout og brugeroplysninger
- `services/event-service` håndterer events, sæder og admin-funktioner for events
- `services/booking-service` håndterer bookinger, annulleringer, venteliste og mock e-mails
- `infrastructure` indeholder Docker Compose og Nginx-konfiguration
- `docs` indeholder dokumentation, API-beskrivelser, demo-noter og rapportmateriale

## Funktioner I Appen

Brugere kan:

1. oprette en konto eller logge ind
2. se events
3. åbne et event og se sæder
4. vælge et eller flere ledige sæder
5. booke valgte sæder
6. se egne bookinger
7. annullere egne fremtidige bookinger
8. skrive sig på venteliste ved udsolgte events
9. logge ud igen

Administratorer kan:

1. logge ind som admin
2. oprette og redigere events
3. publicere, afpublicere, annullere og slette events
4. ændre sædekapacitet, hvor systemet selv opretter nye sæder
5. se bookinger og venteliste for et bestemt event
6. se mock e-mail outbox som bevis på bekræftelser og notifikationer

Det eneste større punkt, der stadig er fravalgt, er deployment på flere servere. Projektet er lavet til at køre samlet via Docker Compose.

GraphQL er også fravalgt, fordi projektet bruger REST API’er.

## Porte

- Gateway/frontend: `8080` som standard
- Gateway kan ændres med `GATEWAY_PORT`
- Auth-service: intern port `8081`
- Event-service: intern port `8082`
- Booking-service: intern port `8083`
- Frontend dev server: `5173`

I den normale Docker Compose-opsætning er backend-portene ikke åbnet direkte på computeren. Det gør det lettere at køre projektet ved siden af andre apps.

## API-Endpoints

De vigtigste endpoints er:

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

Mere detaljeret API-dokumentation ligger i [`docs/api-contracts.md`](docs/api-contracts.md).

## Krav For At Køre Projektet

For almindelig kørsel:

- Docker
- Docker Compose

Kun hvis man vil udvikle uden Docker, skal man også bruge:

- Java 21+
- Node.js 20+
- Maven 3.9+

## Kørsel Med Docker Compose

Fra projektmappen:

```bash
docker compose -f infrastructure/docker-compose.yml up --build
```

Gatewayen serverer frontend og sender API-kald videre til de rigtige backend-services.

Hvis en anden app allerede bruger `8080`, kan man vælge en anden port:

```bash
GATEWAY_PORT=3000 docker compose -f infrastructure/docker-compose.yml up --build
```

Åbn derefter:

```text
http://localhost:3000
```

Hvis man bruger en helt anden port, kan man også angive, hvilken lokal adresse backend må acceptere:

```bash
GATEWAY_PORT=3001 APP_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001 docker compose -f infrastructure/docker-compose.yml up --build
```

Hvis man vil fejlfinde backend-services direkte på `8081`, `8082` og `8083`, kan man bruge udviklingsopsætningen:

```bash
docker compose -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.dev.yml up --build
```

Hvis man vil køre to kopier af dette projekt samtidig, skal den ene kopi have et andet Compose-projektnavn:

```bash
COMPOSE_PROJECT_NAME=distributed-booking-copy GATEWAY_PORT=3001 docker compose -f infrastructure/docker-compose.yml up --build
```

## Frontend-Udvikling

Hvis man vil arbejde direkte med frontenden:

```bash
cd frontend
npm install
npm run dev
```

Vite dev serveren sender API-kald videre til backend-services.

## Backend-Udvikling

Hvis man vil køre backend-services uden Docker:

```bash
mvn -pl services/auth-service spring-boot:run
mvn -pl services/event-service spring-boot:run
mvn -pl services/booking-service spring-boot:run
```

Start `auth-service` først, fordi den kører databasemigrationerne.

## Verifikationsscripts

Når Docker-stacken kører på `8080`, kan disse scripts køres i en anden terminal:

```bash
node scripts/smoke-test.mjs
node scripts/concurrency-demo.mjs
node scripts/measure-baseline.mjs
```

Hvis appen kører på en anden port, for eksempel `3000`, bruges `BOOKING_BASE_URL`:

```bash
BOOKING_BASE_URL=http://localhost:3000 node scripts/smoke-test.mjs
BOOKING_BASE_URL=http://localhost:3000 node scripts/concurrency-demo.mjs
BOOKING_BASE_URL=http://localhost:3000 node scripts/measure-baseline.mjs
```

Scriptsene bruges til at vise:

- at de vigtigste bruger- og adminflows virker
- at multi-seat booking virker
- at venteliste og mock e-mails virker
- at systemet forhindrer dobbeltbooking af samme sæde
- at de vigtigste sider og API’er svarer inden for en målbar baseline

## Samtidighedsdemo

Samtidighedsdemoen viser, at to brugere ikke kan booke det samme sæde samtidig.

Kør:

```bash
node scripts/concurrency-demo.mjs
```

Scriptet opretter et demo-event med ét sæde og lader Alice og Bob prøve at booke samme sæde på samme tid. Testen er kun godkendt, hvis én booking lykkes, og den anden får fejlen `SEAT_ALREADY_BOOKED`.

## Dokumentation

- [Arkitektur](docs/architecture.md)
- [API-kontrakter](docs/api-contracts.md)
- [Security by Design](docs/security-by-design.md)
- [Deployment-guide](docs/deployment.md)
- [Demo-script](docs/demo.md)
- [Deployment-evidence](docs/deployment-evidence.md)
- [Postman Collection](docs/postman/distributed-booking-current.postman_collection.json)
