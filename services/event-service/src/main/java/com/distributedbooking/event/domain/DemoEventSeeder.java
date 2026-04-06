package com.distributedbooking.event.domain;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "app.seed.demo-data", havingValue = "true")
public class DemoEventSeeder implements ApplicationRunner {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public DemoEventSeeder(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Integer eventCount = jdbcTemplate.getJdbcTemplate().queryForObject("SELECT COUNT(*) FROM events", Integer.class);
        if (eventCount != null && eventCount > 0) {
            return;
        }

        List<Map<String, Object>> events = List.of(
                event(UUID.fromString("44444444-4444-4444-4444-444444444444"), "Spring Concert", "Live student concert with reserved seating.", OffsetDateTime.of(2026, 5, 18, 19, 30, 0, 0, ZoneOffset.UTC), "DTU Hall A"),
                event(UUID.fromString("55555555-5555-5555-5555-555555555555"), "Distributed Systems Talk", "Guest lecture about reliable systems at scale.", OffsetDateTime.of(2026, 5, 21, 16, 0, 0, 0, ZoneOffset.UTC), "Building 303 Auditorium"),
                event(UUID.fromString("66666666-6666-6666-6666-666666666666"), "Cinema Night", "Campus movie night with numbered seats.", OffsetDateTime.of(2026, 5, 28, 20, 0, 0, 0, ZoneOffset.UTC), "Student Lounge")
        );

        for (Map<String, Object> event : events) {
            jdbcTemplate.update("""
                            INSERT INTO events (id, title, description, date_time, venue, created_at, updated_at)
                            VALUES (:id, :title, :description, :dateTime, :venue, :createdAt, :updatedAt)
                            """,
                    new MapSqlParameterSource(event)
            );
            seedSeats((UUID) event.get("id"));
        }
    }

    private void seedSeats(UUID eventId) {
        for (String row : List.of("A", "B")) {
            for (int seatNumber = 1; seatNumber <= 12; seatNumber++) {
                String formattedSeat = "%s%02d".formatted(row, seatNumber);
                UUID seatId = UUID.nameUUIDFromBytes((eventId + ":" + formattedSeat).getBytes(StandardCharsets.UTF_8));
                jdbcTemplate.update("""
                                INSERT INTO seats (id, event_id, seat_number, created_at)
                                VALUES (:id, :eventId, :seatNumber, :createdAt)
                                """,
                        Map.of(
                                "id", seatId,
                                "eventId", eventId,
                                "seatNumber", formattedSeat,
                                "createdAt", OffsetDateTime.now(ZoneOffset.UTC)
                        )
                );
            }
        }
    }

    private Map<String, Object> event(UUID id, String title, String description, OffsetDateTime dateTime, String venue) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return Map.of(
                "id", id,
                "title", title,
                "description", description,
                "dateTime", dateTime,
                "venue", venue,
                "createdAt", now,
                "updatedAt", now
        );
    }
}

