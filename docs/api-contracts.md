# API Contracts

## Standard Response Shapes

### UserProfile

```json
{
  "id": "uuid",
  "name": "Alice Example",
  "email": "alice@example.com",
  "role": "USER"
}
```

### EventSummary

```json
{
  "id": "uuid",
  "title": "Spring Concert",
  "dateTime": "2026-05-18T19:30:00Z",
  "venue": "DTU Hall A",
  "availableSeatCount": 24
}
```

### EventDetail

```json
{
  "id": "uuid",
  "title": "Spring Concert",
  "description": "Live student concert.",
  "dateTime": "2026-05-18T19:30:00Z",
  "venue": "DTU Hall A",
  "seatsTotal": 24,
  "seatsAvailable": 24
}
```

### SeatAvailability

```json
{
  "seatId": "uuid",
  "seatNumber": "A01",
  "available": true
}
```

### ErrorResponse

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "fieldErrors": [
    {
      "field": "email",
      "message": "must be a valid email address"
    }
  ]
}
```

## Auth API

### `POST /api/auth/register`

Request:

```json
{
  "name": "Alice Example",
  "email": "alice@example.com",
  "password": "Password123!"
}
```

Responses:

- `201 Created` with `UserProfile`
- `400 Bad Request` with `ErrorResponse`
- `409 Conflict` when the email already exists

### `POST /api/auth/login`

Request:

```json
{
  "email": "alice@example.com",
  "password": "Password123!"
}
```

Responses:

- `200 OK` with `UserProfile` and a JWT HttpOnly cookie
- `401 Unauthorized` with `ErrorResponse`

### `GET /api/auth/me`

Responses:

- `200 OK` with `UserProfile`
- `401 Unauthorized` with `ErrorResponse`

## Event API

### `GET /api/events`

Responses:

- `200 OK` with an array of `EventSummary`
- `401 Unauthorized` with `ErrorResponse`

### `GET /api/events/{eventId}`

Responses:

- `200 OK` with `EventDetail`
- `404 Not Found` with `ErrorResponse`
- `401 Unauthorized` with `ErrorResponse`

### `GET /api/events/{eventId}/seats`

Responses:

- `200 OK` with an array of `SeatAvailability`
- `404 Not Found` with `ErrorResponse`
- `401 Unauthorized` with `ErrorResponse`

## Booking API Stubs

The following endpoints are intentionally present but return `501 Not Implemented` in iteration 1:

- `POST /api/bookings`
- `DELETE /api/bookings/{bookingId}`
- `GET /api/users/me/bookings`

