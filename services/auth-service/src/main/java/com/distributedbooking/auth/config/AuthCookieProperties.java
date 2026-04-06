package com.distributedbooking.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.cookie")
public record AuthCookieProperties(
        String name,
        boolean secure,
        String sameSite,
        int maxAgeDays
) {
}

