package com.distributedbooking.event.api;

import com.distributedbooking.event.domain.EventStatus;
import com.distributedbooking.event.domain.EventQueryService;
import com.distributedbooking.event.domain.EventWriteService;
import com.distributedbooking.event.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private static final UUID ADMIN_VIEWER_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

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
    public EventDetailResponse eventDetail(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        return eventQueryService.getEvent(eventId, UUID.fromString(authenticatedUser.userId()), isAdmin(authenticatedUser));
    }

    @GetMapping("/{eventId}/seats")
    public List<SeatAvailabilityResponse> eventSeats(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        return eventQueryService.getSeats(eventId, UUID.fromString(authenticatedUser.userId()), isAdmin(authenticatedUser));
    }

    @PostMapping
    public ResponseEntity<EventDetailResponse> createEvent(@Valid @RequestBody CreateEventRequest request) {
        UUID eventId = eventWriteService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventQueryService.getEvent(eventId, ADMIN_VIEWER_ID, true));
    }

    @PutMapping("/{eventId}")
    public EventDetailResponse updateEvent(
            @PathVariable UUID eventId,
            @Valid @RequestBody UpdateEventRequest request
    ) {
        eventWriteService.updateEvent(eventId, request);
        return eventQueryService.getEvent(eventId, ADMIN_VIEWER_ID, true);
    }

    @PostMapping("/{eventId}/publish")
    public EventDetailResponse publishEvent(@PathVariable UUID eventId) {
        eventWriteService.updateStatus(eventId, EventStatus.PUBLISHED);
        return eventQueryService.getEvent(eventId, ADMIN_VIEWER_ID, true);
    }

    @PostMapping("/{eventId}/unpublish")
    public EventDetailResponse unpublishEvent(@PathVariable UUID eventId) {
        eventWriteService.updateStatus(eventId, EventStatus.UNPUBLISHED);
        return eventQueryService.getEvent(eventId, ADMIN_VIEWER_ID, true);
    }

    @PostMapping("/{eventId}/cancel")
    public EventDetailResponse cancelEvent(@PathVariable UUID eventId) {
        eventWriteService.updateStatus(eventId, EventStatus.CANCELED);
        return eventQueryService.getEvent(eventId, ADMIN_VIEWER_ID, true);
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID eventId) {
        eventWriteService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(AuthenticatedUser authenticatedUser) {
        return "ADMIN".equals(authenticatedUser.role());
    }
}
