package com.distributedbooking.booking.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI bookingServiceOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Booking Service API")
                .version("1.0")
                .description("Booking API for the distributed booking platform, including single-seat and batch reservation, user booking history, owned cancellation, waitlist entries, admin booking visibility, and mock email outbox evidence."));
    }
}
