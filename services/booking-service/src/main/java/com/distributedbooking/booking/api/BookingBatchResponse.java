package com.distributedbooking.booking.api;

import java.util.List;

public record BookingBatchResponse(
        List<BookingResponse> bookings
) {
}
