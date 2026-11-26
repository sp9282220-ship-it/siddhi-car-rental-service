package com.siddhi.carrental.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Tokens of users who logged out. They are rejected until they would have expired anyway. */
@Component
public class TokenBlacklist {

    private final Map<String, Long> revoked = new ConcurrentHashMap<>();

    public void revoke(String token, long expiresAtEpochSeconds) {
        revoked.put(token, expiresAtEpochSeconds);
        long now = Instant.now().getEpochSecond();
        revoked.values().removeIf(exp -> exp < now); // housekeeping
    }

    public boolean isRevoked(String token) {
        return revoked.containsKey(token);
    }
}
