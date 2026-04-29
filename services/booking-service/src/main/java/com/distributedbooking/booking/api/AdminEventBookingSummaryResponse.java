package com.distributedbooking.booking.api;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminEventBookingSummaryResponse(
        UUID bookingId,
        UUID userId,
        String userEmail,
        UUID seatId,
        String seatNumber,
        OffsetDateTime bookedAt
) {
}
