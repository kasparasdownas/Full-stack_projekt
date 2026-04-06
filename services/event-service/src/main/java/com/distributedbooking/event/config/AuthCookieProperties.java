package com.distributedbooking.event.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.cookie")
public record AuthCookieProperties(
        String name
) {
}

