package com.distributedbooking.auth.domain;

import java.util.List;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "app.seed.demo-data", havingValue = "true")
public class DemoUserSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoUserSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }

        userRepository.saveAll(List.of(
                buildUser(UUID.fromString("11111111-1111-1111-1111-111111111111"), "Admin User", "admin@example.com", "Admin123!", UserRole.ADMIN),
                buildUser(UUID.fromString("22222222-2222-2222-2222-222222222222"), "Alice Example", "alice@example.com", "Password123!", UserRole.USER),
                buildUser(UUID.fromString("33333333-3333-3333-3333-333333333333"), "Bob Example", "bob@example.com", "Password123!", UserRole.USER)
        ));
    }

    private UserEntity buildUser(UUID id, String name, String email, String rawPassword, UserRole role) {
        UserEntity user = new UserEntity();
        user.setId(id);
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        return user;
    }
}

