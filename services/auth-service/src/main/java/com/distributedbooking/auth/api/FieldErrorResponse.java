package com.distributedbooking.auth.api;

public record FieldErrorResponse(
        String field,
        String message
) {
}

