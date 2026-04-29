package com.distributedbooking.booking.domain;

import com.distributedbooking.booking.api.MyBookingSummaryResponse;
import com.distributedbooking.booking.api.AdminEventBookingSummaryResponse;
import com.distributedbooking.booking.api.AdminWaitlistEntryResponse;
import com.distributedbooking.booking.api.EmailOutboxSummaryResponse;
import com.distributedbooking.booking.api.WaitlistEntrySummaryResponse;
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
    private static final RowMapper<AdminEventBookingSummaryResponse> ADMIN_EVENT_BOOKING_ROW_MAPPER =
            BookingQueryService::mapAdminEventBookingSummary;
    private static final RowMapper<WaitlistEntrySummaryResponse> WAITLIST_ENTRY_ROW_MAPPER =
            BookingQueryService::mapWaitlistEntrySummary;
    private static final RowMapper<AdminWaitlistEntryResponse> ADMIN_WAITLIST_ENTRY_ROW_MAPPER =
            BookingQueryService::mapAdminWaitlistEntry;
    private static final RowMapper<EmailOutboxSummaryResponse> EMAIL_OUTBOX_ROW_MAPPER =
            BookingQueryService::mapEmailOutbox;

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

    public List<AdminEventBookingSummaryResponse> listEventBookingsForAdmin(UUID eventId) {
        ensureEventExists(eventId);

        return jdbcTemplate.query("""
                        SELECT b.id AS booking_id,
                               b.user_id,
                               u.email AS user_email,
                               b.seat_id,
                               s.seat_number,
                               b.booked_at
                        FROM bookings b
                        JOIN users u ON u.id = b.user_id
                        JOIN events e ON e.id = b.event_id
                        JOIN seats s ON s.event_id = b.event_id AND s.id = b.seat_id
                        WHERE b.event_id = :eventId
                        ORDER BY s.seat_number ASC
                        """,
                Map.of("eventId", eventId),
                ADMIN_EVENT_BOOKING_ROW_MAPPER
        );
    }

    public List<WaitlistEntrySummaryResponse> listUserWaitlist(UUID userId) {
        return jdbcTemplate.query("""
                        SELECT w.id,
                               w.event_id,
                               e.title AS event_title,
                               e.date_time AS event_date_time,
                               e.venue,
                               w.created_at,
                               w.notified_at
                        FROM waitlist_entries w
                        JOIN events e ON e.id = w.event_id
                        WHERE w.user_id = :userId
                          AND e.deleted_at IS NULL
                        ORDER BY e.date_time ASC, w.created_at ASC
                        """,
                Map.of("userId", userId),
                WAITLIST_ENTRY_ROW_MAPPER
        );
    }

    public List<AdminWaitlistEntryResponse> listEventWaitlistForAdmin(UUID eventId) {
        ensureEventExists(eventId);

        return jdbcTemplate.query("""
                        SELECT w.id,
                               w.user_id,
                               u.email AS user_email,
                               w.created_at,
                               w.notified_at
                        FROM waitlist_entries w
                        JOIN users u ON u.id = w.user_id
                        WHERE w.event_id = :eventId
                        ORDER BY w.created_at ASC
                        """,
                Map.of("eventId", eventId),
                ADMIN_WAITLIST_ENTRY_ROW_MAPPER
        );
    }

    public List<EmailOutboxSummaryResponse> listEmailOutbox() {
        return jdbcTemplate.query("""
                        SELECT id,
                               recipient_email,
                               subject,
                               body,
                               created_at
                        FROM email_outbox
                        ORDER BY created_at DESC
                        LIMIT 100
                        """,
                EMAIL_OUTBOX_ROW_MAPPER
        );
    }

    private void ensureEventExists(UUID eventId) {
        Integer eventCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM events WHERE id = :eventId AND deleted_at IS NULL",
                Map.of("eventId", eventId),
                Integer.class
        );

        if (eventCount == null || eventCount == 0) {
            throw new NotFoundException("EVENT_NOT_FOUND", "Event not found");
        }
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

    private static AdminEventBookingSummaryResponse mapAdminEventBookingSummary(ResultSet rs, int rowNum) throws SQLException {
        return new AdminEventBookingSummaryResponse(
                rs.getObject("booking_id", UUID.class),
                rs.getObject("user_id", UUID.class),
                rs.getString("user_email"),
                rs.getObject("seat_id", UUID.class),
                rs.getString("seat_number"),
                rs.getObject("booked_at", OffsetDateTime.class)
        );
    }

    private static WaitlistEntrySummaryResponse mapWaitlistEntrySummary(ResultSet rs, int rowNum) throws SQLException {
        return new WaitlistEntrySummaryResponse(
                rs.getObject("id", UUID.class),
                rs.getObject("event_id", UUID.class),
                rs.getString("event_title"),
                rs.getObject("event_date_time", OffsetDateTime.class),
                rs.getString("venue"),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("notified_at", OffsetDateTime.class)
        );
    }

    private static AdminWaitlistEntryResponse mapAdminWaitlistEntry(ResultSet rs, int rowNum) throws SQLException {
        return new AdminWaitlistEntryResponse(
                rs.getObject("id", UUID.class),
                rs.getObject("user_id", UUID.class),
                rs.getString("user_email"),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("notified_at", OffsetDateTime.class)
        );
    }

    private static EmailOutboxSummaryResponse mapEmailOutbox(ResultSet rs, int rowNum) throws SQLException {
        return new EmailOutboxSummaryResponse(
                rs.getObject("id", UUID.class),
                rs.getString("recipient_email"),
                rs.getString("subject"),
                rs.getString("body"),
                rs.getObject("created_at", OffsetDateTime.class)
        );
    }
}
