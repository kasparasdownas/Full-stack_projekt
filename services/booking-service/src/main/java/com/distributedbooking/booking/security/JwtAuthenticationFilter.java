package com.distributedbooking.booking.security;

import com.distributedbooking.booking.config.AuthCookieProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AuthCookieProperties authCookieProperties;

    public JwtAuthenticationFilter(JwtService jwtService, AuthCookieProperties authCookieProperties) {
        this.jwtService = jwtService;
        this.authCookieProperties = authCookieProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            resolveToken(request)
                    .flatMap(jwtService::parseToken)
                    .ifPresent(this::authenticate);
        }

        filterChain.doFilter(request, response);
    }

    private Optional<String> resolveToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }

        return Arrays.stream(cookies)
                .filter(cookie -> authCookieProperties.name().equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private void authenticate(AuthenticatedUser authenticatedUser) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                authenticatedUser,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + authenticatedUser.role()))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}

