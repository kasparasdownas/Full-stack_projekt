package com.distributedbooking.auth.security;

public record AuthenticatedUser(
        String userId,
        String email,
        String role
) {
}

