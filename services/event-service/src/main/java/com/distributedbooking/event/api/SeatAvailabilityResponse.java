package com.distributedbooking.event.api;

import java.util.UUID;

public record SeatAvailabilityResponse(
        UUID seatId,
        String seatNumber,
        boolean available
) {
}

