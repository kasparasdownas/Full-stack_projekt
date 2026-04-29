package com.distributedbooking.event.api;

import com.distributedbooking.event.domain.EventQueryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/events")
public class AdminEventController {

    private final EventQueryService eventQueryService;

    public AdminEventController(EventQueryService eventQueryService) {
        this.eventQueryService = eventQueryService;
    }

    @GetMapping
    public List<AdminEventSummaryResponse> listAdminEvents() {
        return eventQueryService.listAdminEvents();
    }
}
