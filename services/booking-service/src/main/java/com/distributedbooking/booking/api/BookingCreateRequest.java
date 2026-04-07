package com.distributedbooking.booking.api;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record BookingCreateRequest(
        @NotNull UUID eventId,
        @NotNull UUID seatId
) {
}
