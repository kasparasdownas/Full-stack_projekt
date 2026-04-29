package com.distributedbooking.event.domain;

import com.distributedbooking.event.api.EventDetailResponse;
import com.distributedbooking.event.api.EventSummaryResponse;
import com.distributedbooking.event.api.AdminEventSummaryResponse;
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
            rs.getInt("available_seat_count"),
            EventStatus.valueOf(rs.getString("status"))
    );

    private static final RowMapper<AdminEventSummaryResponse> ADMIN_EVENT_SUMMARY_ROW_MAPPER = (rs, rowNum) -> new AdminEventSummaryResponse(
            rs.getObject("id", UUID.class),
            rs.getString("title"),
            rs.getObject("date_time", OffsetDateTime.class),
            rs.getString("venue"),
            EventStatus.valueOf(rs.getString("status")),
            rs.getInt("seats_total"),
            rs.getInt("seats_available"),
            rs.getInt("booking_count")
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
                               COUNT(s.id) FILTER (WHERE b.id IS NULL) AS available_seat_count,
                               e.status
                        FROM events e
                        LEFT JOIN seats s ON s.event_id = e.id
                        LEFT JOIN bookings b ON b.event_id = e.id AND b.seat_id = s.id
                        WHERE e.deleted_at IS NULL
                          AND e.status = 'PUBLISHED'
                        GROUP BY e.id, e.title, e.date_time, e.venue, e.status
                        ORDER BY e.date_time ASC, e.title ASC
                        """,
                EVENT_SUMMARY_ROW_MAPPER
        );
    }

    public List<AdminEventSummaryResponse> listAdminEvents() {
        return jdbcTemplate.query("""
                        SELECT e.id,
                               e.title,
                               e.date_time,
                               e.venue,
                               e.status,
                               COUNT(DISTINCT s.id) AS seats_total,
                               COUNT(DISTINCT s.id) FILTER (WHERE b.id IS NULL) AS seats_available,
                               COUNT(DISTINCT b.id) AS booking_count
                        FROM events e
                        LEFT JOIN seats s ON s.event_id = e.id
                        LEFT JOIN bookings b ON b.event_id = e.id AND b.seat_id = s.id
                        WHERE e.deleted_at IS NULL
                        GROUP BY e.id, e.title, e.date_time, e.venue, e.status
                        ORDER BY e.date_time ASC, e.title ASC
                        """,
                ADMIN_EVENT_SUMMARY_ROW_MAPPER
        );
    }

    public EventDetailResponse getEvent(UUID eventId, UUID userId, boolean admin) {
        List<EventDetailResponse> results = jdbcTemplate.query("""
                        SELECT e.id,
                               e.title,
                               e.description,
                               e.date_time,
                               e.venue,
                               COUNT(s.id) AS seats_total,
                               COUNT(s.id) FILTER (WHERE b.id IS NULL) AS seats_available,
                               e.status
                        FROM events e
                        LEFT JOIN seats s ON s.event_id = e.id
                        LEFT JOIN bookings b ON b.event_id = e.id AND b.seat_id = s.id
                        WHERE e.id = :eventId
                          AND e.deleted_at IS NULL
                          AND (
                              :admin = TRUE
                              OR e.status = 'PUBLISHED'
                              OR EXISTS (
                                  SELECT 1
                                  FROM bookings owned_booking
                                  WHERE owned_booking.event_id = e.id
                                    AND owned_booking.user_id = :userId
                              )
                          )
                        GROUP BY e.id, e.title, e.description, e.date_time, e.venue, e.status
                        """,
                Map.of("eventId", eventId, "userId", userId, "admin", admin),
                this::mapEventDetail
        );

        return results.stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("EVENT_NOT_FOUND", "Event not found"));
    }

    public List<SeatAvailabilityResponse> getSeats(UUID eventId, UUID userId, boolean admin) {
        getEvent(eventId, userId, admin);

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
                rs.getInt("seats_available"),
                EventStatus.valueOf(rs.getString("status"))
        );
    }
}
