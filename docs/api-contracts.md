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
  "availableSeatCount": 24,
  "status": "PUBLISHED"
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
  "seatsAvailable": 24,
  "status": "PUBLISHED"
}
```

### CreateEventRequest

```json
{
  "title": "Guest Lecture",
  "description": "Reliable distributed systems in practice.",
  "dateTime": "2026-06-01T19:30:00Z",
  "venue": "Building 101",
  "seatCapacity": 14,
  "status": "PUBLISHED"
}
```

### UpdateEventRequest

```json
{
  "title": "Guest Lecture",
  "description": "Reliable distributed systems in practice.",
  "dateTime": "2026-06-01T19:30:00Z",
  "venue": "Building 101",
  "status": "PUBLISHED",
  "seatCapacity": 18
}
```

### AdminEventSummary

```json
{
  "id": "uuid",
  "title": "Spring Concert",
  "dateTime": "2026-05-18T19:30:00Z",
  "venue": "DTU Hall A",
  "status": "PUBLISHED",
  "seatsTotal": 24,
  "seatsAvailable": 21,
  "bookingCount": 3
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

### BookingBatchCreateRequest

```json
{
  "eventId": "uuid",
  "seatIds": ["uuid", "uuid"]
}
```

### BookingBatchResponse

```json
{
  "bookings": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "seatId": "uuid",
      "seatNumber": "A01",
      "bookedAt": "2026-05-18T18:00:00Z"
    }
  ]
}
```

### MyBookingSummary

```json
{
  "id": "uuid",
  "eventId": "uuid",
  "eventTitle": "Spring Concert",
  "eventDateTime": "2026-05-18T19:30:00Z",
  "venue": "DTU Hall A",
  "seatNumber": "A01",
  "bookedAt": "2026-05-18T18:00:00Z"
}
```

### AdminEventBookingSummary

```json
{
  "bookingId": "uuid",
  "userId": "uuid",
  "userEmail": "alice@example.com",
  "seatId": "uuid",
  "seatNumber": "A01",
  "bookedAt": "2026-05-18T18:00:00Z"
}
```

### WaitlistEntrySummary

```json
{
  "id": "uuid",
  "eventId": "uuid",
  "eventTitle": "Spring Concert",
  "eventDateTime": "2026-05-18T19:30:00Z",
  "venue": "DTU Hall A",
  "createdAt": "2026-05-18T18:00:00Z",
  "notifiedAt": null
}
```

### AdminWaitlistEntry

```json
{
  "id": "uuid",
  "userId": "uuid",
  "userEmail": "alice@example.com",
  "createdAt": "2026-05-18T18:00:00Z",
  "notifiedAt": "2026-05-18T18:10:00Z"
}
```

### EmailOutboxSummary

```json
{
  "id": "uuid",
  "recipientEmail": "alice@example.com",
  "subject": "Booking confirmed: Spring Concert",
  "body": "Your booking is confirmed.",
  "createdAt": "2026-05-18T18:00:00Z"
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

### `GET /api/auth/csrf`

Responses:

- `204 No Content`
- sets readable `XSRF-TOKEN` cookie for unsafe requests

Unsafe methods (`POST`, `PUT`, `PATCH`, `DELETE`) require the `X-XSRF-TOKEN` header matching the `XSRF-TOKEN` cookie. Missing or invalid CSRF tokens return `403 Forbidden`.

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
- `403 Forbidden` when the CSRF token is missing or invalid
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
- `403 Forbidden` when the CSRF token is missing or invalid

### `POST /api/auth/logout`

Responses:

- `204 No Content` and a `Set-Cookie` header clearing the auth cookie
- `403 Forbidden` when the CSRF token is missing or invalid

### `GET /api/auth/me`

Responses:

- `200 OK` with `UserProfile`
- `401 Unauthorized` with `ErrorResponse`

## Event API

### `GET /api/events`

Responses:

- `200 OK` with an array of `EventSummary`
- `401 Unauthorized` with `ErrorResponse`

### `POST /api/events`

Request:

```json
{
  "title": "Guest Lecture",
  "description": "Reliable distributed systems in practice.",
  "dateTime": "2026-06-01T19:30:00Z",
  "venue": "Building 101",
  "seatCapacity": 14
}
```

Responses:

- `201 Created` with `EventDetail`
- `400 Bad Request` with `ErrorResponse`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` with `ErrorResponse`
- `403 Forbidden` when the CSRF token is missing or invalid

### `GET /api/admin/events`

Responses:

- `200 OK` with an array of `AdminEventSummary`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` with `ErrorResponse`

### `PUT /api/events/{eventId}`

Request: `UpdateEventRequest`

Responses:

- `200 OK` with `EventDetail`
- `400 Bad Request` with `ErrorResponse`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` with `ErrorResponse`
- `404 Not Found` with `EVENT_NOT_FOUND`
- `409 Conflict` with `CAPACITY_REDUCTION_BLOCKED`

### `POST /api/events/{eventId}/publish`

Responses:

- `200 OK` with `EventDetail`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` with `ErrorResponse`
- `404 Not Found` with `EVENT_NOT_FOUND`

### `POST /api/events/{eventId}/unpublish`

Responses:

- `200 OK` with `EventDetail`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` with `ErrorResponse`
- `404 Not Found` with `EVENT_NOT_FOUND`

### `POST /api/events/{eventId}/cancel`

Responses:

- `200 OK` with `EventDetail`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` with `ErrorResponse`
- `404 Not Found` with `EVENT_NOT_FOUND`

### `DELETE /api/events/{eventId}`

Responses:

- `204 No Content`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` with `ErrorResponse`
- `404 Not Found` with `EVENT_NOT_FOUND`
- `409 Conflict` with `EVENT_HAS_DEPENDENCIES`

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
- `403 Forbidden` when the CSRF token is missing or invalid
- `404 Not Found` with `EVENT_NOT_FOUND` or `SEAT_NOT_FOUND`
- `409 Conflict` with `SEAT_ALREADY_BOOKED` or `EVENT_NOT_BOOKABLE`

### `POST /api/bookings/batch`

Request: `BookingBatchCreateRequest`

Responses:

- `201 Created` with `BookingBatchResponse`
- `400 Bad Request` with `ErrorResponse`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` when the CSRF token is missing or invalid
- `404 Not Found` with `EVENT_NOT_FOUND` or `SEAT_NOT_FOUND`
- `409 Conflict` with `SEAT_ALREADY_BOOKED` or `EVENT_NOT_BOOKABLE`

### `GET /api/users/me/bookings`

Responses:

- `200 OK` with an array of `MyBookingSummary`
- `401 Unauthorized` with `ErrorResponse`

### `DELETE /api/bookings/{bookingId}`

Responses:

- `204 No Content`
- `400 Bad Request` with `VALIDATION_ERROR` when the booking id is malformed
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` when the CSRF token is missing or invalid
- `404 Not Found` with `BOOKING_NOT_FOUND`
- `409 Conflict` with `CANNOT_CANCEL_PAST_EVENT`

### `POST /api/events/{eventId}/waitlist`

Responses:

- `204 No Content`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` when the CSRF token is missing or invalid
- `404 Not Found` with `EVENT_NOT_FOUND`
- `409 Conflict` with `EVENT_NOT_SOLD_OUT`, `EVENT_NOT_BOOKABLE`, or `WAITLIST_ALREADY_JOINED`

### `DELETE /api/events/{eventId}/waitlist`

Responses:

- `204 No Content`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` when the CSRF token is missing or invalid
- `404 Not Found` with `WAITLIST_ENTRY_NOT_FOUND`

### `GET /api/users/me/waitlist`

Responses:

- `200 OK` with an array of `WaitlistEntrySummary`
- `401 Unauthorized` with `ErrorResponse`

### `GET /api/admin/events/{eventId}/bookings`

Responses:

- `200 OK` with an array of `AdminEventBookingSummary`
- `400 Bad Request` with `VALIDATION_ERROR` when the event id is malformed
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` with `ErrorResponse`
- `404 Not Found` with `EVENT_NOT_FOUND`

### `GET /api/admin/events/{eventId}/waitlist`

Responses:

- `200 OK` with an array of `AdminWaitlistEntry`
- `400 Bad Request` with `VALIDATION_ERROR` when the event id is malformed
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` with `ErrorResponse`
- `404 Not Found` with `EVENT_NOT_FOUND`

### `GET /api/admin/email-outbox`

Responses:

- `200 OK` with an array of `EmailOutboxSummary`
- `401 Unauthorized` with `ErrorResponse`
- `403 Forbidden` with `ErrorResponse`
