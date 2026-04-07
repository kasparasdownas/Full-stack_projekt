package com.distributedbooking.booking.domain;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
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
    private static final UUID USER_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID EVENT_ID = UUID.fromString("44444444-4444-4444-4444-444444444444");
    private static final UUID OTHER_EVENT_ID = UUID.fromString("55555555-5555-5555-5555-555555555555");
    private static final UUID SEAT_A01 = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID SEAT_A02 = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private static final UUID SEAT_B01 = UUID.fromString("00000000-0000-0000-0000-000000000003");

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("bookingdb")
            .withUsername("booking_app")
            .withPassword("booking_app");

    @Autowired
    private BookingWriteService bookingWriteService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

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
                .subject(USER_ID.toString())
                .claim("email", "alice@example.com")
                .claim("role", "USER")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
        authCookie = new Cookie("booking_access_token", token);
        jdbcTemplate.getJdbcOperations().update("DELETE FROM bookings");
    }

    @Test
    void reserveSeatRejectsDuplicateEventSeatCombination() {
        bookingWriteService.reserveSeat(USER_ID, EVENT_ID, SEAT_A01);

        assertThatThrownBy(() -> bookingWriteService.reserveSeat(USER_ID, EVENT_ID, SEAT_A01))
                .isInstanceOf(com.distributedbooking.booking.domain.ConflictException.class);
    }

    @Test
    void createBookingReturnsCreatedBooking() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventId": "44444444-4444-4444-4444-444444444444",
                                  "seatId": "00000000-0000-0000-0000-000000000002"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.eventId").value(EVENT_ID.toString()))
                .andExpect(jsonPath("$.seatId").value(SEAT_A02.toString()))
                .andExpect(jsonPath("$.seatNumber").value("A02"))
                .andExpect(jsonPath("$.bookedAt").isNotEmpty());
    }

    @Test
    void createBookingRejectsAlreadyBookedSeat() throws Exception {
        bookingWriteService.reserveSeat(USER_ID, EVENT_ID, SEAT_A01);

        mockMvc.perform(post("/api/bookings")
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventId": "44444444-4444-4444-4444-444444444444",
                                  "seatId": "00000000-0000-0000-0000-000000000001"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("SEAT_ALREADY_BOOKED"));
    }

    @Test
    void createBookingReturnsEventNotFound() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventId": "66666666-6666-6666-6666-666666666666",
                                  "seatId": "00000000-0000-0000-0000-000000000001"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("EVENT_NOT_FOUND"));
    }

    @Test
    void createBookingReturnsSeatNotFoundWhenSeatBelongsToAnotherEvent() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .cookie(authCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventId": "44444444-4444-4444-4444-444444444444",
                                  "seatId": "00000000-0000-0000-0000-000000000003"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("SEAT_NOT_FOUND"));
    }

    @Test
    void createBookingRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "eventId": "44444444-4444-4444-4444-444444444444",
                                  "seatId": "00000000-0000-0000-0000-000000000001"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void bookingHistoryEndpointRemainsStubbed() throws Exception {
        mockMvc.perform(get("/api/users/me/bookings").cookie(authCookie))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.code").value("NOT_IMPLEMENTED"));
    }
}
