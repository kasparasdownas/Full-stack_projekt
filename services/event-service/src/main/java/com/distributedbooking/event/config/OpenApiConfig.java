package com.distributedbooking.event.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI eventServiceOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Event Service API")
                .version("1.0")
                .description("Event catalogue, seat availability, and admin event lifecycle API for the distributed booking platform, including status changes, safe deletion, and capacity-based seat generation."));
    }
}
