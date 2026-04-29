package com.distributedbooking.event.api;

import com.distributedbooking.event.domain.EventStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record EventSummaryResponse(
        UUID id,
        String title,
        OffsetDateTime dateTime,
        String venue,
        int availableSeatCount,
        EventStatus status
) {
}
