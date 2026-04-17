package com.distributedbooking.event.api;

import com.distributedbooking.event.domain.EventQueryService;
import com.distributedbooking.event.domain.EventWriteService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventQueryService eventQueryService;
    private final EventWriteService eventWriteService;

    public EventController(EventQueryService eventQueryService, EventWriteService eventWriteService) {
        this.eventQueryService = eventQueryService;
        this.eventWriteService = eventWriteService;
    }

    @GetMapping
    public List<EventSummaryResponse> listEvents() {
        return eventQueryService.listEvents();
    }

    @GetMapping("/{eventId}")
    public EventDetailResponse eventDetail(@PathVariable UUID eventId) {
        return eventQueryService.getEvent(eventId);
    }

    @GetMapping("/{eventId}/seats")
    public List<SeatAvailabilityResponse> eventSeats(@PathVariable UUID eventId) {
        return eventQueryService.getSeats(eventId);
    }

    @PostMapping
    public ResponseEntity<EventDetailResponse> createEvent(@Valid @RequestBody CreateEventRequest request) {
        UUID eventId = eventWriteService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventQueryService.getEvent(eventId));
    }
}
