package com.distributedbooking.event.api;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EventDetailResponse(
        UUID id,
        String title,
        String description,
        OffsetDateTime dateTime,
        String venue,
        int seatsTotal,
        int seatsAvailable
) {
}

