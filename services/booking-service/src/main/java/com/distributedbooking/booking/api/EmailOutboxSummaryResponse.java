package com.distributedbooking.booking.api;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EmailOutboxSummaryResponse(
        UUID id,
        String recipientEmail,
        String subject,
        String body,
        OffsetDateTime createdAt
) {
}
