package com.distributedbooking.event.api;

import com.distributedbooking.event.domain.EventStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record CreateEventRequest(
        @NotBlank
        @Size(max = 160)
        String title,
        @NotBlank
        String description,
        @NotNull
        OffsetDateTime dateTime,
        @NotBlank
        @Size(max = 160)
        String venue,
        @Min(1)
        @Max(120)
        int seatCapacity,
        EventStatus status
) {
}
