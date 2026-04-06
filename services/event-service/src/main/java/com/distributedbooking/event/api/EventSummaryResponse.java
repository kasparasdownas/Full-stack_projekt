package com.distributedbooking.event.api;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EventSummaryResponse(
        UUID id,
        String title,
        OffsetDateTime dateTime,
        String venue,
        int availableSeatCount
) {
}

