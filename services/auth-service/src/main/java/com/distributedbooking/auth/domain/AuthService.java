package com.distributedbooking.auth.domain;

import com.distributedbooking.auth.api.LoginRequest;
import com.distributedbooking.auth.api.RegisterRequest;
import com.distributedbooking.auth.security.AuthenticatedUser;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserEntity register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "An account with that email already exists");
        }

        UserEntity user = new UserEntity();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.USER);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserEntity authenticate(LoginRequest request) {
        UserEntity user = userRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password");
        }

        return user;
    }

    @Transactional(readOnly = true)
    public UserEntity currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser authenticatedUser)) {
            throw new UnauthorizedException("UNAUTHORIZED", "Authentication is required");
        }

        return userRepository.findById(UUID.fromString(authenticatedUser.userId()))
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "The authenticated user could not be found"));
    }
}

