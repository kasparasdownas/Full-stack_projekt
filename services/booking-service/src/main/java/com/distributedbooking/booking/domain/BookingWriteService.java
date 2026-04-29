package com.distributedbooking.booking.domain;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashSet;
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
        EventRecord event = findBookableEvent(eventId);
        SeatRecord seat = findSeat(eventId, seatId);

        BookingReservation reservation = insertBooking(userId, eventId, seatId, seat.seatNumber());
        createEmail(
                findUserEmail(userId),
                "Booking confirmed: " + event.title(),
                "Your booking for %s at %s, seat %s, is confirmed.".formatted(event.title(), event.venue(), seat.seatNumber())
        );
        return reservation;
    }

    @Transactional
    public List<BookingReservation> reserveSeats(UUID userId, UUID eventId, List<UUID> seatIds) {
        EventRecord event = findBookableEvent(eventId);
        List<UUID> uniqueSeatIds = new ArrayList<>(new LinkedHashSet<>(seatIds));
        if (uniqueSeatIds.size() != seatIds.size()) {
            throw new ConflictException("SEAT_ALREADY_BOOKED", "Duplicate seats cannot be booked in one request");
        }

        List<SeatRecord> seats = findSeats(eventId, uniqueSeatIds);
        List<BookingReservation> reservations = new ArrayList<>();
        for (SeatRecord seat : seats) {
            reservations.add(insertBooking(userId, eventId, seat.id(), seat.seatNumber()));
        }

        String seatList = reservations.stream()
                .map(BookingReservation::seatNumber)
                .reduce((left, right) -> left + ", " + right)
                .orElse("");
        createEmail(
                findUserEmail(userId),
                "Booking confirmed: " + event.title(),
                "Your booking for %s at %s, seats %s, is confirmed.".formatted(event.title(), event.venue(), seatList)
        );
        return reservations;
    }

    private BookingReservation insertBooking(UUID userId, UUID eventId, UUID seatId, String seatNumber) {
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

        return new BookingReservation(bookingId, eventId, seatId, seatNumber, bookedAt);
    }

    @Transactional
    public void cancelBooking(UUID userId, UUID bookingId) {
        BookingRecord booking = findOwnedBooking(userId, bookingId);
        if (!booking.eventDateTime().isAfter(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new ConflictException("CANNOT_CANCEL_PAST_EVENT", "Past event bookings cannot be canceled");
        }

        boolean wasSoldOut = isSoldOut(booking.eventId());

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

        createEmail(
                booking.userEmail(),
                "Booking cancelled: " + booking.eventTitle(),
                "Your booking for %s, seat %s, has been cancelled.".formatted(booking.eventTitle(), booking.seatNumber())
        );

        if (wasSoldOut) {
            notifyFirstWaitlistedUser(booking.eventId(), booking.eventTitle());
        }
    }

    @Transactional
    public void joinWaitlist(UUID userId, UUID eventId) {
        EventRecord event = findEvent(eventId);
        if (!"PUBLISHED".equals(event.status())) {
            throw new ConflictException("EVENT_NOT_BOOKABLE", "Only published events can be waitlisted");
        }
        if (!isSoldOut(eventId)) {
            throw new ConflictException("EVENT_NOT_SOLD_OUT", "Waitlist is only available for sold-out events");
        }

        try {
            jdbcTemplate.update("""
                            INSERT INTO waitlist_entries (id, user_id, event_id, created_at)
                            VALUES (:id, :userId, :eventId, :createdAt)
                            """,
                    Map.of(
                            "id", UUID.randomUUID(),
                            "userId", userId,
                            "eventId", eventId,
                            "createdAt", OffsetDateTime.now(ZoneOffset.UTC)
                    )
            );
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("WAITLIST_ALREADY_JOINED", "You are already on the waitlist for this event");
        }

        createEmail(
                findUserEmail(userId),
                "Waitlist joined: " + event.title(),
                "You joined the waitlist for %s at %s.".formatted(event.title(), event.venue())
        );
    }

    @Transactional
    public void leaveWaitlist(UUID userId, UUID eventId) {
        int deletedRows = jdbcTemplate.update("""
                        DELETE FROM waitlist_entries
                        WHERE user_id = :userId
                          AND event_id = :eventId
                        """,
                Map.of("userId", userId, "eventId", eventId)
        );

        if (deletedRows == 0) {
            throw new NotFoundException("WAITLIST_ENTRY_NOT_FOUND", "Waitlist entry not found");
        }
    }

    private EventRecord findBookableEvent(UUID eventId) {
        EventRecord event = findEvent(eventId);
        if (!"PUBLISHED".equals(event.status())) {
            throw new ConflictException("EVENT_NOT_BOOKABLE", "Event is not open for booking");
        }
        return event;
    }

    private EventRecord findEvent(UUID eventId) {
        List<EventRecord> events = jdbcTemplate.query("""
                        SELECT id, title, date_time, venue, status
                        FROM events
                        WHERE id = :eventId
                          AND deleted_at IS NULL
                        """,
                Map.of("eventId", eventId),
                (rs, rowNum) -> new EventRecord(
                        rs.getObject("id", UUID.class),
                        rs.getString("title"),
                        rs.getObject("date_time", OffsetDateTime.class),
                        rs.getString("venue"),
                        rs.getString("status")
                )
        );

        return events.stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("EVENT_NOT_FOUND", "Event not found"));
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

    private List<SeatRecord> findSeats(UUID eventId, List<UUID> seatIds) {
        List<SeatRecord> seats = jdbcTemplate.query("""
                        SELECT id, seat_number
                        FROM seats
                        WHERE event_id = :eventId AND id IN (:seatIds)
                        ORDER BY seat_number ASC
                        """,
                Map.of("eventId", eventId, "seatIds", seatIds),
                (rs, rowNum) -> new SeatRecord(
                        rs.getObject("id", UUID.class),
                        rs.getString("seat_number")
                )
        );

        if (seats.size() != seatIds.size()) {
            throw new NotFoundException("SEAT_NOT_FOUND", "One or more seats were not found for this event");
        }

        return seats;
    }

    private BookingRecord findOwnedBooking(UUID userId, UUID bookingId) {
        List<BookingRecord> bookings = jdbcTemplate.query("""
                        SELECT b.id,
                               b.event_id,
                               e.title AS event_title,
                               e.date_time AS event_date_time,
                               s.seat_number,
                               u.email AS user_email
                        FROM bookings b
                        JOIN events e ON e.id = b.event_id
                        JOIN seats s ON s.event_id = b.event_id AND s.id = b.seat_id
                        JOIN users u ON u.id = b.user_id
                        WHERE b.id = :bookingId
                          AND b.user_id = :userId
                        """,
                Map.of("bookingId", bookingId, "userId", userId),
                (rs, rowNum) -> new BookingRecord(
                        rs.getObject("id", UUID.class),
                        rs.getObject("event_id", UUID.class),
                        rs.getString("event_title"),
                        rs.getObject("event_date_time", OffsetDateTime.class),
                        rs.getString("seat_number"),
                        rs.getString("user_email")
                )
        );

        return bookings.stream()
                .findFirst()
                .orElseThrow(() -> new NotFoundException("BOOKING_NOT_FOUND", "Booking not found"));
    }

    private boolean isSoldOut(UUID eventId) {
        Integer availableSeats = jdbcTemplate.queryForObject("""
                        SELECT COUNT(s.id) FILTER (WHERE b.id IS NULL)
                        FROM seats s
                        LEFT JOIN bookings b ON b.event_id = s.event_id AND b.seat_id = s.id
                        WHERE s.event_id = :eventId
                        """,
                Map.of("eventId", eventId),
                Integer.class
        );
        return availableSeats != null && availableSeats == 0;
    }

    private void notifyFirstWaitlistedUser(UUID eventId, String eventTitle) {
        List<WaitlistNotificationCandidate> candidates = jdbcTemplate.query("""
                        SELECT w.id, u.email
                        FROM waitlist_entries w
                        JOIN users u ON u.id = w.user_id
                        WHERE w.event_id = :eventId
                          AND w.notified_at IS NULL
                        ORDER BY w.created_at ASC
                        LIMIT 1
                        """,
                Map.of("eventId", eventId),
                (rs, rowNum) -> new WaitlistNotificationCandidate(
                        rs.getObject("id", UUID.class),
                        rs.getString("email")
                )
        );

        candidates.stream().findFirst().ifPresent(candidate -> {
            OffsetDateTime notifiedAt = OffsetDateTime.now(ZoneOffset.UTC);
            jdbcTemplate.update("""
                            UPDATE waitlist_entries
                            SET notified_at = :notifiedAt
                            WHERE id = :id
                            """,
                    Map.of("id", candidate.id(), "notifiedAt", notifiedAt)
            );
            createEmail(
                    candidate.email(),
                    "Seat available: " + eventTitle,
                    "A seat is now available for %s. Log in to book it.".formatted(eventTitle)
            );
        });
    }

    private String findUserEmail(UUID userId) {
        return jdbcTemplate.queryForObject(
                "SELECT email FROM users WHERE id = :userId",
                Map.of("userId", userId),
                String.class
        );
    }

    private void createEmail(String recipientEmail, String subject, String body) {
        jdbcTemplate.update("""
                        INSERT INTO email_outbox (id, recipient_email, subject, body, created_at)
                        VALUES (:id, :recipientEmail, :subject, :body, :createdAt)
                        """,
                Map.of(
                        "id", UUID.randomUUID(),
                        "recipientEmail", recipientEmail,
                        "subject", subject,
                        "body", body,
                        "createdAt", OffsetDateTime.now(ZoneOffset.UTC)
                )
        );
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

    private record EventRecord(UUID id, String title, OffsetDateTime dateTime, String venue, String status) {
    }

    private record BookingRecord(UUID id, UUID eventId, String eventTitle, OffsetDateTime eventDateTime, String seatNumber, String userEmail) {
    }

    private record WaitlistNotificationCandidate(UUID id, String email) {
    }
}
