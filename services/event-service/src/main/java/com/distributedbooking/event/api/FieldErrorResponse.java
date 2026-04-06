package com.distributedbooking.event.api;

public record FieldErrorResponse(
        String field,
        String message
) {
}

