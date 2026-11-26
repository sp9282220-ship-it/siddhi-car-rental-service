package com.siddhi.carrental.security;

import com.siddhi.carrental.entity.Role;
import com.siddhi.carrental.entity.User;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private final JwtUtil jwt = new JwtUtil("unit-test-secret-key-that-is-long-enough-123", 60);

    private User user() {
        User u = new User();
        u.setId(42L);
        u.setEmail("admin@test.com");
        u.setRole(Role.ADMIN);
        return u;
    }

    @Test
    void tokenRoundTrip() {
        var data = jwt.parse(jwt.generateToken(user())).orElseThrow();
        assertThat(data.userId()).isEqualTo(42L);
        assertThat(data.email()).isEqualTo("admin@test.com");
        assertThat(data.role()).isEqualTo(Role.ADMIN);
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = jwt.generateToken(user());
        String[] p = token.split("\\.");
        String forged = p[0] + "." + p[1].substring(0, p[1].length() - 2) + "xx." + p[2];
        assertThat(jwt.parse(forged)).isEmpty();
        assertThat(jwt.parse("not-a-token")).isEmpty();
    }

    @Test
    void tokenSignedWithOtherSecretIsRejected() {
        JwtUtil other = new JwtUtil("a-completely-different-secret-key-0123456789", 60);
        assertThat(jwt.parse(other.generateToken(user()))).isEmpty();
    }

    @Test
    void expiredTokenIsRejected() {
        JwtUtil expired = new JwtUtil("unit-test-secret-key-that-is-long-enough-123", 0);
        assertThat(expired.parse(expired.generateToken(user()))).isEmpty();
    }
}
