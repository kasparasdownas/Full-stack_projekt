package com.distributedbooking.event.api;

import com.distributedbooking.event.domain.EventQueryService;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventQueryService eventQueryService;

    public EventController(EventQueryService eventQueryService) {
        this.eventQueryService = eventQueryService;
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
}

