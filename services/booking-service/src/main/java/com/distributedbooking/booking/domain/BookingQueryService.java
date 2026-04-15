package com.distributedbooking.booking.domain;

import com.distributedbooking.booking.api.MyBookingSummaryResponse;
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
public class BookingQueryService {

    private static final RowMapper<MyBookingSummaryResponse> BOOKING_SUMMARY_ROW_MAPPER = BookingQueryService::mapBookingSummary;

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public BookingQueryService(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<MyBookingSummaryResponse> listUserBookings(UUID userId) {
        return jdbcTemplate.query("""
                        SELECT b.id,
                               b.event_id,
                               e.title AS event_title,
                               e.date_time AS event_date_time,
                               e.venue,
                               s.seat_number,
                               b.booked_at
                        FROM bookings b
                        JOIN events e ON e.id = b.event_id
                        JOIN seats s ON s.event_id = b.event_id AND s.id = b.seat_id
                        WHERE b.user_id = :userId
                        ORDER BY e.date_time ASC, s.seat_number ASC
                        """,
                Map.of("userId", userId),
                BOOKING_SUMMARY_ROW_MAPPER
        );
    }

    private static MyBookingSummaryResponse mapBookingSummary(ResultSet rs, int rowNum) throws SQLException {
        return new MyBookingSummaryResponse(
                rs.getObject("id", UUID.class),
                rs.getObject("event_id", UUID.class),
                rs.getString("event_title"),
                rs.getObject("event_date_time", OffsetDateTime.class),
                rs.getString("venue"),
                rs.getString("seat_number"),
                rs.getObject("booked_at", OffsetDateTime.class)
        );
    }
}
