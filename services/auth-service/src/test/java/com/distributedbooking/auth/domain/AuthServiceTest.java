package com.distributedbooking.auth.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.distributedbooking.auth.api.LoginRequest;
import com.distributedbooking.auth.api.RegisterRequest;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerCreatesUserWhenEmailIsAvailable() {
        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Password123!")).thenReturn("hashed-password");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserEntity created = authService.register(new RegisterRequest("Alice Example", "Alice@example.com", "Password123!"));

        assertThat(created.getEmail()).isEqualTo("alice@example.com");
        assertThat(created.getRole()).isEqualTo(UserRole.USER);
        assertThat(created.getPasswordHash()).isEqualTo("hashed-password");
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(new UserEntity()));

        assertThatThrownBy(() -> authService.register(new RegisterRequest("Alice Example", "alice@example.com", "Password123!")))
                .isInstanceOf(ConflictException.class)
                .hasMessage("An account with that email already exists");
    }

    @Test
    void authenticateRejectsWrongPassword() {
        UserEntity user = new UserEntity();
        user.setEmail("alice@example.com");
        user.setPasswordHash("stored-hash");

        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword123!", "stored-hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.authenticate(new LoginRequest("alice@example.com", "WrongPassword123!")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");
    }
}

