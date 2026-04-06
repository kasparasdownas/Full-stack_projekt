package com.distributedbooking.booking.security;

public record AuthenticatedUser(
        String userId,
        String email,
        String role
) {
}

