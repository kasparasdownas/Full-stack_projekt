package com.distributedbooking.booking.api;

import java.time.OffsetDateTime;
import java.util.UUID;

public record WaitlistEntrySummaryResponse(
        UUID id,
        UUID eventId,
        String eventTitle,
        OffsetDateTime eventDateTime,
        String venue,
        OffsetDateTime createdAt,
        OffsetDateTime notifiedAt
) {
}
