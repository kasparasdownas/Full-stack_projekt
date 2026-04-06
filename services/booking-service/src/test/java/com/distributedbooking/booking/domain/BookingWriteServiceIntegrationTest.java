package com.distributedbooking.booking.domain;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(properties = {
        "spring.sql.init.mode=always"
})
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class BookingWriteServiceIntegrationTest {

    private static final String JWT_SECRET = "integration-test-secret-value-with-more-than-thirty-two-chars";

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("bookingdb")
            .withUsername("booking_app")
            .withPassword("booking_app");

    @Autowired
    private BookingWriteService bookingWriteService;

    @Autowired
    private MockMvc mockMvc;

    private Cookie authCookie;

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("app.security.jwt.secret", () -> JWT_SECRET);
    }

    @BeforeEach
    void setUp() {
        String token = Jwts.builder()
                .subject("22222222-2222-2222-2222-222222222222")
                .claim("email", "alice@example.com")
                .claim("role", "USER")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
        authCookie = new Cookie("booking_access_token", token);
    }

    @Test
    void reserveSeatRejectsDuplicateEventSeatCombination() {
        UUID userId = UUID.fromString("22222222-2222-2222-2222-222222222222");
        UUID eventId = UUID.fromString("44444444-4444-4444-4444-444444444444");
        UUID seatId = UUID.fromString("00000000-0000-0000-0000-000000000001");

        bookingWriteService.reserveSeat(userId, eventId, seatId);

        assertThatThrownBy(() -> bookingWriteService.reserveSeat(userId, eventId, seatId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void bookingEndpointsRemainStubbedInIterationOne() throws Exception {
        mockMvc.perform(get("/api/users/me/bookings").cookie(authCookie))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.code").value("NOT_IMPLEMENTED"));
    }
}
