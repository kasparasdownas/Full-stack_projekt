package com.distributedbooking.event.api;

import com.distributedbooking.event.domain.EventStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminEventSummaryResponse(
        UUID id,
        String title,
        OffsetDateTime dateTime,
        String venue,
        EventStatus status,
        int seatsTotal,
        int seatsAvailable,
        int bookingCount
) {
}
