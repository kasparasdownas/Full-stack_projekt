package com.distributedbooking.booking.api;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MyBookingSummaryResponse(
        UUID id,
        UUID eventId,
        String eventTitle,
        OffsetDateTime eventDateTime,
        String venue,
        String seatNumber,
        OffsetDateTime bookedAt
) {
}
