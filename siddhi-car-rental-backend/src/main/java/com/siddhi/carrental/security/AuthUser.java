package com.siddhi.carrental.security;

import com.siddhi.carrental.entity.Role;

/** The logged-in user attached to each authenticated request. Use with @AuthenticationPrincipal. */
public record AuthUser(Long id, String email, String fullName, Role role) {
    public boolean isAdmin() { return role == Role.ADMIN; }
}
