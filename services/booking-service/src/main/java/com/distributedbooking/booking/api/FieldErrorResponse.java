package com.distributedbooking.booking.api;

public record FieldErrorResponse(
        String field,
        String message
) {
}

