package com.distributedbooking.booking.api;

import com.distributedbooking.booking.domain.BookingReservation;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID eventId,
        UUID seatId,
        String seatNumber,
        OffsetDateTime bookedAt
) {

    public static BookingResponse from(BookingReservation bookingReservation) {
        return new BookingResponse(
                bookingReservation.id(),
                bookingReservation.eventId(),
                bookingReservation.seatId(),
                bookingReservation.seatNumber(),
                bookingReservation.bookedAt()
        );
    }
}
