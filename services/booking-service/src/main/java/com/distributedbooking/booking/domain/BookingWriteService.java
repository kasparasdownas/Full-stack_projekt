package com.distributedbooking.booking.domain;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;
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
    public UUID reserveSeat(UUID userId, UUID eventId, UUID seatId) {
        UUID bookingId = UUID.randomUUID();
        jdbcTemplate.update("""
                        INSERT INTO bookings (id, user_id, event_id, seat_id, booked_at)
                        VALUES (:id, :userId, :eventId, :seatId, :bookedAt)
                        """,
                Map.of(
                        "id", bookingId,
                        "userId", userId,
                        "eventId", eventId,
                        "seatId", seatId,
                        "bookedAt", OffsetDateTime.now(ZoneOffset.UTC)
                )
        );
        return bookingId;
    }
}

