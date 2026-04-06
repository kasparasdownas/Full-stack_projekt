package com.distributedbooking.auth.api;

import com.distributedbooking.auth.domain.UserEntity;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String name,
        String email,
        String role
) {

    public static UserProfileResponse from(UserEntity user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}

