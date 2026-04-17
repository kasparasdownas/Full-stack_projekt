package com.distributedbooking.event.domain;

import com.distributedbooking.event.api.CreateEventRequest;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventWriteService {

    private static final int SEATS_PER_ROW = 12;

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public EventWriteService(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public UUID createEvent(CreateEventRequest request) {
        UUID eventId = UUID.randomUUID();

        jdbcTemplate.update("""
                        INSERT INTO events (id, title, description, date_time, venue)
                        VALUES (:id, :title, :description, :dateTime, :venue)
                        """,
                Map.of(
                        "id", eventId,
                        "title", request.title().trim(),
                        "description", request.description().trim(),
                        "dateTime", request.dateTime(),
                        "venue", request.venue().trim()
                )
        );

        for (int seatIndex = 0; seatIndex < request.seatCapacity(); seatIndex++) {
            String seatNumber = seatNumberForIndex(seatIndex);
            UUID seatId = UUID.nameUUIDFromBytes((eventId + ":" + seatNumber).getBytes(StandardCharsets.UTF_8));

            jdbcTemplate.update("""
                            INSERT INTO seats (id, event_id, seat_number)
                            VALUES (:id, :eventId, :seatNumber)
                            """,
                    Map.of(
                            "id", seatId,
                            "eventId", eventId,
                            "seatNumber", seatNumber
                    )
            );
        }

        return eventId;
    }

    private String seatNumberForIndex(int seatIndex) {
        int rowIndex = seatIndex / SEATS_PER_ROW;
        int seatInRow = (seatIndex % SEATS_PER_ROW) + 1;
        char rowLetter = (char) ('A' + rowIndex);
        return "%s%02d".formatted(rowLetter, seatInRow);
    }
}
