package com.distributedbooking.event.api;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.http.MediaType.APPLICATION_JSON;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(properties = {
        "spring.sql.init.mode=always",
        "app.seed.demo-data=false"
})
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
class EventControllerIntegrationTest {

    private static final String JWT_SECRET = "integration-test-secret-value-with-more-than-thirty-two-chars";

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("bookingdb")
            .withUsername("booking_app")
            .withPassword("booking_app");

    @Autowired
    private MockMvc mockMvc;

    private Cookie userAuthCookie;
    private Cookie adminAuthCookie;

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("app.security.jwt.secret", () -> JWT_SECRET);
    }

    @BeforeEach
    void setUp() {
        userAuthCookie = authCookie("22222222-2222-2222-2222-222222222222", "alice@example.com", "USER");
        adminAuthCookie = authCookie("11111111-1111-1111-1111-111111111111", "admin@example.com", "ADMIN");
    }

    @Test
    void listEventsReturnsAvailabilityCounts() throws Exception {
        mockMvc.perform(get("/api/events").cookie(userAuthCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Spring Concert")))
                .andExpect(jsonPath("$[0].availableSeatCount", is(2)));
    }

    @Test
    void getEventSeatsReturnsBookedSeatAsUnavailable() throws Exception {
        mockMvc.perform(get("/api/events/44444444-4444-4444-4444-444444444444/seats").cookie(userAuthCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[1].seatNumber", is("A02")))
                .andExpect(jsonPath("$[1].available", is(false)));
    }

    @Test
    void adminCanCreateEventAndGeneratedSeatsAppearInReadEndpoints() throws Exception {
        String payload = """
                {
                  "title": "Admin Added Event",
                  "description": "Created through the admin endpoint.",
                  "dateTime": "2026-06-01T19:30:00Z",
                  "venue": "Building 101",
                  "seatCapacity": 14
                }
                """;

        mockMvc.perform(post("/api/events")
                        .cookie(adminAuthCookie)
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Admin Added Event")))
                .andExpect(jsonPath("$.venue", is("Building 101")))
                .andExpect(jsonPath("$.seatsTotal", is(14)))
                .andExpect(jsonPath("$.seatsAvailable", is(14)));

        mockMvc.perform(get("/api/events").cookie(userAuthCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", hasItem("Admin Added Event")));

        String createdEventId = mockMvc.perform(get("/api/events").cookie(userAuthCookie))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String eventId = com.jayway.jsonpath.JsonPath.read(
                createdEventId,
                "$[?(@.title == 'Admin Added Event')].id[0]"
        );

        mockMvc.perform(get("/api/events/" + eventId + "/seats").cookie(userAuthCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(14)))
                .andExpect(jsonPath("$[0].seatNumber", is("A01")))
                .andExpect(jsonPath("$[11].seatNumber", is("A12")))
                .andExpect(jsonPath("$[12].seatNumber", is("B01")))
                .andExpect(jsonPath("$[13].seatNumber", is("B02")))
                .andExpect(jsonPath("$[13].available", is(true)));
    }

    @Test
    void regularUserCannotCreateEvent() throws Exception {
        String payload = """
                {
                  "title": "User Attempt",
                  "description": "Should be forbidden.",
                  "dateTime": "2026-06-01T19:30:00Z",
                  "venue": "Building 101",
                  "seatCapacity": 12
                }
                """;

        mockMvc.perform(post("/api/events")
                        .cookie(userAuthCookie)
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("FORBIDDEN")));
    }

    @Test
    void createEventRequiresAuthentication() throws Exception {
        String payload = """
                {
                  "title": "Anonymous Attempt",
                  "description": "Should require auth.",
                  "dateTime": "2026-06-01T19:30:00Z",
                  "venue": "Building 101",
                  "seatCapacity": 12
                }
                """;

        mockMvc.perform(post("/api/events")
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createEventRejectsInvalidPayload() throws Exception {
        String payload = """
                {
                  "title": "",
                  "description": "",
                  "dateTime": "2026-06-01T19:30:00Z",
                  "venue": "",
                  "seatCapacity": 0
                }
                """;

        mockMvc.perform(post("/api/events")
                        .cookie(adminAuthCookie)
                        .contentType(APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("VALIDATION_ERROR")));
    }

    @Test
    void requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isUnauthorized());
    }

    private Cookie authCookie(String userId, String email, String role) {
        String token = Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .claim("role", role)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
        return new Cookie("booking_access_token", token);
    }
}
