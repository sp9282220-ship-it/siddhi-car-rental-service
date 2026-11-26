package com.siddhi.carrental.controller;

import com.siddhi.carrental.dto.AuthDtos.*;
import com.siddhi.carrental.dto.MiscDtos.MessageResponse;
import com.siddhi.carrental.security.AuthUser;
import com.siddhi.carrental.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /api/auth/register  -> creates a CUSTOMER account and logs them in
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    // POST /api/auth/logout  -> the token stops working
    @PostMapping("/logout")
    public MessageResponse logout(@RequestHeader(value = "Authorization", required = false) String header) {
        authService.logout(header != null && header.startsWith("Bearer ") ? header.substring(7).trim() : null);
        return new MessageResponse("Logged out successfully");
    }

    // GET /api/auth/me  -> the logged-in user's profile
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AuthUser user) {
        return authService.getProfile(user.id());
    }
}
