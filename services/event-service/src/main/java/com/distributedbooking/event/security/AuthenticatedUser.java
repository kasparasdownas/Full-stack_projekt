package com.distributedbooking.event.security;

public record AuthenticatedUser(
        String userId,
        String email,
        String role
) {
}

