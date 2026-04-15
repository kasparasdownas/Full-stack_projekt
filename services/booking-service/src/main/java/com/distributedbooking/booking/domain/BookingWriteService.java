package com.distributedbooking.booking.domain;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingWriteService {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public BookingWriteService(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public BookingReservation reserveSeat(UUID userId, UUID eventId, UUID seatId) {
        ensureEventExists(eventId);
        SeatRecord seat = findSeat(eventId, seatId);

        UUID bookingId = UUID.randomUUID();
        OffsetDateTime bookedAt = OffsetDateTime.now(ZoneOffset.UTC);

        try {
            jdbcTemplate.update("""
                            INSERT INTO bookings (id, user_id, event_id, seat_id, booked_at)
                            VALUES (:id, :userId, :eventId, :seatId, :bookedAt)
                            """,
                    Map.of(
                            "id", bookingId,
                            "userId", userId,
                            "eventId", eventId,
                            "seatId", seatId,
                            "bookedAt", bookedAt
                    )
            );
        } catch (DataIntegrityViolationException exception) {
            if (isSeatAlreadyBooked(exception)) {
                throw new ConflictException("SEAT_ALREADY_BOOKED", "Seat already booked");
            }
            throw exception;
        }

        return new BookingReservation(bookingId, eventId, seatId, seat.seatNumber(), bookedAt);
    }

    @Transactional
    public void cancelBooking(UUID userId, UUID bookingId) {
        int deletedRows = jdbcTemplate.update("""
                        DELETE FROM bookings
                        WHERE id = :bookingId
                          AND user_id = :userId
                        """,
                Map.of(
                        "bookingId", bookingId,
                        "userId", userId
                )
        );

        if (deletedRows == 0) {
            throw new NotFoundException("BOOKING_NOT_FOUND", "Booking not found");
        }
    }

    private void ensureEventExists(UUID eventId) {
        Integer eventCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM events WHERE id = :eventId",
                Map.of("eventId", eventId),
                Integer.class
        );

        if (eventCount == null || eventCount == 0) {
            throw new NotFoundException("EVENT_NOT_FOUND", "Event not found");
        }
    }

    private SeatRecord findSeat(UUID eventId, UUID seatId) {
        List<SeatRecord> seats = jdbcTemplate.query("""
                        SELECT id, seat_number
                        FROM seats
                        WHERE event_id = :eventId AND id = :seatId
                        """,
                Map.of("eventId", eventId, "seatId", seatId),
                (rs, rowNum) -> new SeatRecord(
                        rs.getObject("id", UUID.class),
                        rs.getString("seat_number")
                )
        );

        return seats.stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("SEAT_NOT_FOUND", "Seat not found for this event"));
    }

    private boolean isSeatAlreadyBooked(DataIntegrityViolationException exception) {
        Throwable mostSpecificCause = NestedExceptionUtils.getMostSpecificCause(exception);
        return mostSpecificCause != null
                && mostSpecificCause.getMessage() != null
                && mostSpecificCause.getMessage().contains("uq_bookings_event_seat");
    }

    private record SeatRecord(
            UUID id,
            String seatNumber
    ) {
    }
}
