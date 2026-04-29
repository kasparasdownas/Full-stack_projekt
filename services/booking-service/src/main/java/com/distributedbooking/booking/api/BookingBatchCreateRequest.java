package com.distributedbooking.booking.api;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record BookingBatchCreateRequest(
        @NotNull
        UUID eventId,
        @NotEmpty
        @Size(max = 10)
        List<@NotNull UUID> seatIds
) {
}
