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

### BookingCreateRequest

```json
{
  "eventId": "uuid",
  "seatId": "uuid"
}
```

### BookingResponse

```json
{
  "id": "uuid",
  "eventId": "uuid",
  "seatId": "uuid",
  "seatNumber": "A01",
  "bookedAt": "2026-05-18T18:00:00Z"
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

### `POST /api/auth/logout`

Responses:

- `204 No Content` and a `Set-Cookie` header clearing the auth cookie

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

## Booking API

### `POST /api/bookings`

Request:

```json
{
  "eventId": "44444444-4444-4444-4444-444444444444",
  "seatId": "00000000-0000-0000-0000-000000000001"
}
```

Responses:

- `201 Created` with `BookingResponse`
- `400 Bad Request` with `ErrorResponse`
- `401 Unauthorized` with `ErrorResponse`
- `404 Not Found` with `EVENT_NOT_FOUND` or `SEAT_NOT_FOUND`
- `409 Conflict` with `SEAT_ALREADY_BOOKED`

### Deferred booking endpoints

The following endpoints remain intentionally stubbed and return `501 Not Implemented`:

- `DELETE /api/bookings/{bookingId}`
- `GET /api/users/me/bookings`
