package com.distributedbooking.booking.api;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminWaitlistEntryResponse(
        UUID id,
        UUID userId,
        String userEmail,
        OffsetDateTime createdAt,
        OffsetDateTime notifiedAt
) {
}
