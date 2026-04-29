package com.distributedbooking.booking.api;

import com.distributedbooking.booking.domain.BookingReservation;
import com.distributedbooking.booking.domain.BookingQueryService;
import com.distributedbooking.booking.domain.BookingWriteService;
import com.distributedbooking.booking.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BookingController {

    private final BookingQueryService bookingQueryService;
    private final BookingWriteService bookingWriteService;

    public BookingController(BookingQueryService bookingQueryService, BookingWriteService bookingWriteService) {
        this.bookingQueryService = bookingQueryService;
        this.bookingWriteService = bookingWriteService;
    }

    @PostMapping("/api/bookings")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        BookingReservation bookingReservation = bookingWriteService.reserveSeat(
                UUID.fromString(authenticatedUser.userId()),
                request.eventId(),
                request.seatId()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BookingResponse.from(bookingReservation));
    }

    @PostMapping("/api/bookings/batch")
    public ResponseEntity<BookingBatchResponse> createBatchBooking(
            @Valid @RequestBody BookingBatchCreateRequest request,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        List<BookingResponse> bookings = bookingWriteService.reserveSeats(
                        UUID.fromString(authenticatedUser.userId()),
                        request.eventId(),
                        request.seatIds()
                ).stream()
                .map(BookingResponse::from)
                .toList();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new BookingBatchResponse(bookings));
    }

    @DeleteMapping("/api/bookings/{bookingId}")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        bookingWriteService.cancelBooking(UUID.fromString(authenticatedUser.userId()), bookingId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/users/me/bookings")
    public ResponseEntity<List<MyBookingSummaryResponse>> userBookings(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        return ResponseEntity.ok(bookingQueryService.listUserBookings(UUID.fromString(authenticatedUser.userId())));
    }

    @PostMapping("/api/events/{eventId}/waitlist")
    public ResponseEntity<Void> joinWaitlist(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        bookingWriteService.joinWaitlist(UUID.fromString(authenticatedUser.userId()), eventId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/events/{eventId}/waitlist")
    public ResponseEntity<Void> leaveWaitlist(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        bookingWriteService.leaveWaitlist(UUID.fromString(authenticatedUser.userId()), eventId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/users/me/waitlist")
    public ResponseEntity<List<WaitlistEntrySummaryResponse>> userWaitlist(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        return ResponseEntity.ok(bookingQueryService.listUserWaitlist(UUID.fromString(authenticatedUser.userId())));
    }

    @GetMapping("/api/admin/events/{eventId}/bookings")
    public ResponseEntity<List<AdminEventBookingSummaryResponse>> adminEventBookings(@PathVariable UUID eventId) {
        return ResponseEntity.ok(bookingQueryService.listEventBookingsForAdmin(eventId));
    }

    @GetMapping("/api/admin/events/{eventId}/waitlist")
    public ResponseEntity<List<AdminWaitlistEntryResponse>> adminEventWaitlist(@PathVariable UUID eventId) {
        return ResponseEntity.ok(bookingQueryService.listEventWaitlistForAdmin(eventId));
    }

    @GetMapping("/api/admin/email-outbox")
    public ResponseEntity<List<EmailOutboxSummaryResponse>> adminEmailOutbox() {
        return ResponseEntity.ok(bookingQueryService.listEmailOutbox());
    }
}
