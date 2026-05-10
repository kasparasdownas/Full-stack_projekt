package com.distributedbooking.auth.api;

import com.distributedbooking.auth.config.AuthCookieProperties;
import com.distributedbooking.auth.domain.AuthService;
import com.distributedbooking.auth.domain.UserEntity;
import com.distributedbooking.auth.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthCookieProperties authCookieProperties;

    public AuthController(AuthService authService, JwtService jwtService, AuthCookieProperties authCookieProperties) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.authCookieProperties = authCookieProperties;
    }

    @PostMapping("/register")
    public ResponseEntity<UserProfileResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserEntity user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserProfileResponse.from(user));
    }

    @PostMapping("/login")
    public ResponseEntity<UserProfileResponse> login(@Valid @RequestBody LoginRequest request) {
        UserEntity user = authService.authenticate(request);
        ResponseCookie authCookie = buildAuthCookie(jwtService.generateToken(user), java.time.Duration.ofDays(authCookieProperties.maxAgeDays()));

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookie.toString())
                .body(UserProfileResponse.from(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie clearedAuthCookie = buildAuthCookie("", java.time.Duration.ZERO);

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearedAuthCookie.toString())
                .build();
    }

    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(CsrfToken csrfToken) {
        ResponseCookie csrfCookie = ResponseCookie.from("XSRF-TOKEN", csrfToken.getToken())
                .httpOnly(false)
                .secure(authCookieProperties.secure())
                .sameSite(authCookieProperties.sameSite())
                .path("/")
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, csrfCookie.toString())
                .build();
    }

    @GetMapping("/me")
    public UserProfileResponse me() {
        return UserProfileResponse.from(authService.currentUser());
    }

    private ResponseCookie buildAuthCookie(String value, java.time.Duration maxAge) {
        return ResponseCookie.from(authCookieProperties.name(), value)
                .httpOnly(true)
                .secure(authCookieProperties.secure())
                .sameSite(authCookieProperties.sameSite())
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}
