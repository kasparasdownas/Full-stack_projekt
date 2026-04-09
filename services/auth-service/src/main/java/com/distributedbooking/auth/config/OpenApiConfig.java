package com.distributedbooking.auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI authServiceOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Auth Service API")
                .version("1.0")
                .description("Authentication API for the distributed booking platform, including login, logout, registration, and profile lookup."));
    }
}
