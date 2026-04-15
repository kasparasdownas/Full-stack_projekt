package com.distributedbooking.booking.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BookingStubController {

    @PostMapping("/api/bookings")
    public ResponseEntity<ErrorResponse> createBooking() {
        return notImplemented();
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
                .body(ErrorResponse.of("NOT_IMPLEMENTED", "Booking writes and history arrive in iteration 2"));
    }
}

