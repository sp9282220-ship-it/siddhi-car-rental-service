package com.siddhi.carrental.controller;

import com.siddhi.carrental.dto.AuthDtos.*;
import com.siddhi.carrental.dto.MiscDtos.MessageResponse;
import com.siddhi.carrental.security.AuthUser;
import com.siddhi.carrental.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Logged-in user's own profile. */
@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public UserResponse get(@AuthenticationPrincipal AuthUser user) {
        return authService.getProfile(user.id());
    }

    // PUT /api/users/me  {fullName, phone}
    @PutMapping
    public UserResponse update(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody ProfileUpdateRequest req) {
        return authService.updateProfile(user.id(), req);
    }

    // PUT /api/users/me/password  {currentPassword, newPassword}
    @PutMapping("/password")
    public MessageResponse changePassword(@AuthenticationPrincipal AuthUser user, @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(user.id(), req);
        return new MessageResponse("Password changed successfully");
    }
}
