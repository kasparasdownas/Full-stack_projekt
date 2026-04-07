package com.distributedbooking.booking.api;

import com.distributedbooking.booking.domain.BookingReservation;
import com.distributedbooking.booking.domain.BookingWriteService;
import com.distributedbooking.booking.security.AuthenticatedUser;
import jakarta.validation.Valid;
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

    private final BookingWriteService bookingWriteService;

    public BookingController(BookingWriteService bookingWriteService) {
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

    @DeleteMapping("/api/bookings/{bookingId}")
    public ResponseEntity<ErrorResponse> cancelBooking(@PathVariable String bookingId) {
        return notImplemented();
    }

    @GetMapping("/api/users/me/bookings")
    public ResponseEntity<ErrorResponse> userBookings() {
        return notImplemented();
    }

    private ResponseEntity<ErrorResponse> notImplemented() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ErrorResponse.of("NOT_IMPLEMENTED", "Booking cancellation and history arrive in a later iteration"));
    }
}
