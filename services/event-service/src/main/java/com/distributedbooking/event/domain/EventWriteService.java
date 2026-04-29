package com.distributedbooking.event.domain;

import com.distributedbooking.event.api.CreateEventRequest;
import com.distributedbooking.event.api.UpdateEventRequest;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventWriteService {

    private static final int SEATS_PER_ROW = 12;

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public EventWriteService(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public UUID createEvent(CreateEventRequest request) {
        UUID eventId = UUID.randomUUID();
        EventStatus status = request.status() == null ? EventStatus.PUBLISHED : request.status();

        jdbcTemplate.update("""
                        INSERT INTO events (id, title, description, date_time, venue, status)
                        VALUES (:id, :title, :description, :dateTime, :venue, :status)
                        """,
                Map.of(
                        "id", eventId,
                        "title", request.title().trim(),
                        "description", request.description().trim(),
                        "dateTime", request.dateTime(),
                        "venue", request.venue().trim(),
                        "status", status.name()
                )
        );

        addSeats(eventId, 0, request.seatCapacity());

        return eventId;
    }

    @Transactional
    public void updateEvent(UUID eventId, UpdateEventRequest request) {
        ensureActiveEventExists(eventId);
        resizeSeats(eventId, request.seatCapacity());

        int updatedRows = jdbcTemplate.update("""
                        UPDATE events
                        SET title = :title,
                            description = :description,
                            date_time = :dateTime,
                            venue = :venue,
                            status = :status,
                            updated_at = :updatedAt
                        WHERE id = :eventId
                          AND deleted_at IS NULL
                        """,
                Map.of(
                        "eventId", eventId,
                        "title", request.title().trim(),
                        "description", request.description().trim(),
                        "dateTime", request.dateTime(),
                        "venue", request.venue().trim(),
                        "status", request.status().name(),
                        "updatedAt", OffsetDateTime.now(ZoneOffset.UTC)
                )
        );

        if (updatedRows == 0) {
            throw new NotFoundException("EVENT_NOT_FOUND", "Event not found");
        }
    }

    @Transactional
    public void updateStatus(UUID eventId, EventStatus status) {
        int updatedRows = jdbcTemplate.update("""
                        UPDATE events
                        SET status = :status,
                            updated_at = :updatedAt
                        WHERE id = :eventId
                          AND deleted_at IS NULL
                        """,
                Map.of(
                        "eventId", eventId,
                        "status", status.name(),
                        "updatedAt", OffsetDateTime.now(ZoneOffset.UTC)
                )
        );

        if (updatedRows == 0) {
            throw new NotFoundException("EVENT_NOT_FOUND", "Event not found");
        }
    }

    @Transactional
    public void deleteEvent(UUID eventId) {
        ensureActiveEventExists(eventId);

        Integer dependencyCount = jdbcTemplate.queryForObject("""
                        SELECT
                            (SELECT COUNT(*) FROM bookings WHERE event_id = :eventId)
                            +
                            (SELECT COUNT(*) FROM waitlist_entries WHERE event_id = :eventId)
                        """,
                Map.of("eventId", eventId),
                Integer.class
        );

        if (dependencyCount != null && dependencyCount > 0) {
            throw new ConflictException("EVENT_HAS_DEPENDENCIES", "Event has bookings or waitlist entries and cannot be deleted");
        }

        jdbcTemplate.update("""
                        UPDATE events
                        SET deleted_at = :deletedAt,
                            updated_at = :deletedAt
                        WHERE id = :eventId
                          AND deleted_at IS NULL
                        """,
                Map.of(
                        "eventId", eventId,
                        "deletedAt", OffsetDateTime.now(ZoneOffset.UTC)
                )
        );
    }

    private void resizeSeats(UUID eventId, int requestedCapacity) {
        List<SeatRecord> existingSeats = jdbcTemplate.query("""
                        SELECT s.id, s.seat_number, CASE WHEN b.id IS NULL THEN FALSE ELSE TRUE END AS booked
                        FROM seats s
                        LEFT JOIN bookings b ON b.event_id = s.event_id AND b.seat_id = s.id
                        WHERE s.event_id = :eventId
                        ORDER BY s.seat_number ASC
                        """,
                Map.of("eventId", eventId),
                (rs, rowNum) -> new SeatRecord(
                        rs.getObject("id", UUID.class),
                        rs.getString("seat_number"),
                        rs.getBoolean("booked")
                )
        );

        if (requestedCapacity > existingSeats.size()) {
            addSeats(eventId, existingSeats.size(), requestedCapacity);
            return;
        }

        if (requestedCapacity < existingSeats.size()) {
            List<SeatRecord> seatsToRemove = existingSeats.subList(requestedCapacity, existingSeats.size());
            boolean wouldRemoveBookedSeat = seatsToRemove.stream().anyMatch(SeatRecord::booked);
            if (wouldRemoveBookedSeat) {
                throw new ConflictException("CAPACITY_REDUCTION_BLOCKED", "Capacity reduction would remove booked seats");
            }

            for (SeatRecord seat : seatsToRemove) {
                jdbcTemplate.update("DELETE FROM seats WHERE id = :seatId", Map.of("seatId", seat.id()));
            }
        }
    }

    private void addSeats(UUID eventId, int startIndex, int endExclusive) {
        for (int seatIndex = startIndex; seatIndex < endExclusive; seatIndex++) {
            String seatNumber = seatNumberForIndex(seatIndex);
            UUID seatId = UUID.nameUUIDFromBytes((eventId + ":" + seatNumber).getBytes(StandardCharsets.UTF_8));

            jdbcTemplate.update("""
                            INSERT INTO seats (id, event_id, seat_number)
                            VALUES (:id, :eventId, :seatNumber)
                            ON CONFLICT (event_id, seat_number) DO NOTHING
                            """,
                    Map.of(
                            "id", seatId,
                            "eventId", eventId,
                            "seatNumber", seatNumber
                    )
            );
        }
    }

    private void ensureActiveEventExists(UUID eventId) {
        Integer eventCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM events WHERE id = :eventId AND deleted_at IS NULL",
                Map.of("eventId", eventId),
                Integer.class
        );

        if (eventCount == null || eventCount == 0) {
            throw new NotFoundException("EVENT_NOT_FOUND", "Event not found");
        }
    }

    private String seatNumberForIndex(int seatIndex) {
        int rowIndex = seatIndex / SEATS_PER_ROW;
        int seatInRow = (seatIndex % SEATS_PER_ROW) + 1;
        char rowLetter = (char) ('A' + rowIndex);
        return "%s%02d".formatted(rowLetter, seatInRow);
    }

    private record SeatRecord(UUID id, String seatNumber, boolean booked) {
    }
}
