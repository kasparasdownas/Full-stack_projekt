package com.distributedbooking.booking.domain;

import java.time.OffsetDateTime;
import java.util.UUID;

public record BookingReservation(
        UUID id,
        UUID eventId,
        UUID seatId,
        String seatNumber,
        OffsetDateTime bookedAt
) {
}
