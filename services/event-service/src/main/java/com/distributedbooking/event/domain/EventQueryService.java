package com.distributedbooking.event.domain;

import com.distributedbooking.event.api.EventDetailResponse;
import com.distributedbooking.event.api.EventSummaryResponse;
import com.distributedbooking.event.api.SeatAvailabilityResponse;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventQueryService {

    private static final RowMapper<EventSummaryResponse> EVENT_SUMMARY_ROW_MAPPER = (rs, rowNum) -> new EventSummaryResponse(
            rs.getObject("id", UUID.class),
            rs.getString("title"),
            rs.getObject("date_time", OffsetDateTime.class),
            rs.getString("venue"),
            rs.getInt("available_seat_count")
    );

    private static final RowMapper<SeatAvailabilityResponse> SEAT_ROW_MAPPER = (rs, rowNum) -> new SeatAvailabilityResponse(
            rs.getObject("id", UUID.class),
            rs.getString("seat_number"),
            rs.getBoolean("available")
    );

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public EventQueryService(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<EventSummaryResponse> listEvents() {
        return jdbcTemplate.query("""
                        SELECT e.id,
                               e.title,
                               e.date_time,
                               e.venue,
                               COUNT(s.id) FILTER (WHERE b.id IS NULL) AS available_seat_count
                        FROM events e
                        LEFT JOIN seats s ON s.event_id = e.id
                        LEFT JOIN bookings b ON b.event_id = e.id AND b.seat_id = s.id
                        GROUP BY e.id, e.title, e.date_time, e.venue
                        ORDER BY e.date_time ASC, e.title ASC
                        """,
                EVENT_SUMMARY_ROW_MAPPER
        );
    }

    public EventDetailResponse getEvent(UUID eventId) {
        List<EventDetailResponse> results = jdbcTemplate.query("""
                        SELECT e.id,
                               e.title,
                               e.description,
                               e.date_time,
                               e.venue,
                               COUNT(s.id) AS seats_total,
                               COUNT(s.id) FILTER (WHERE b.id IS NULL) AS seats_available
                        FROM events e
                        LEFT JOIN seats s ON s.event_id = e.id
                        LEFT JOIN bookings b ON b.event_id = e.id AND b.seat_id = s.id
                        WHERE e.id = :eventId
                        GROUP BY e.id, e.title, e.description, e.date_time, e.venue
                        """,
                Map.of("eventId", eventId),
                this::mapEventDetail
        );

        return results.stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("EVENT_NOT_FOUND", "Event not found"));
    }

    public List<SeatAvailabilityResponse> getSeats(UUID eventId) {
        if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM events WHERE id = :eventId", Map.of("eventId", eventId), Integer.class) == 0) {
            throw new NotFoundException("EVENT_NOT_FOUND", "Event not found");
        }

        return jdbcTemplate.query("""
                        SELECT s.id,
                               s.seat_number,
                               CASE WHEN b.id IS NULL THEN TRUE ELSE FALSE END AS available
                        FROM seats s
                        LEFT JOIN bookings b ON b.event_id = s.event_id AND b.seat_id = s.id
                        WHERE s.event_id = :eventId
                        ORDER BY s.seat_number ASC
                        """,
                Map.of("eventId", eventId),
                SEAT_ROW_MAPPER
        );
    }

    private EventDetailResponse mapEventDetail(ResultSet rs, int rowNum) throws SQLException {
        return new EventDetailResponse(
                rs.getObject("id", UUID.class),
                rs.getString("title"),
                rs.getString("description"),
                rs.getObject("date_time", OffsetDateTime.class),
                rs.getString("venue"),
                rs.getInt("seats_total"),
                rs.getInt("seats_available")
        );
    }
}

