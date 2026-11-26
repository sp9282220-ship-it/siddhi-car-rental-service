package com.siddhi.carrental.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siddhi.carrental.entity.Role;
import com.siddhi.carrental.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Creates and checks signed login tokens (standard JWT, HMAC-SHA256).
 * Built with the JDK only, so no extra library is needed.
 */
@Component
public class JwtUtil {

    public record TokenData(Long userId, String email, Role role, long expiresAt) { }

    private static final Base64.Encoder ENC = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DEC = Base64.getUrlDecoder();
    private static final String HEADER = ENC.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));

    private final byte[] secret;
    private final long expirationSeconds;
    private final ObjectMapper mapper = new ObjectMapper();

    public JwtUtil(@Value("${app.jwt.secret}") String secret,
                   @Value("${app.jwt.expiration-minutes:480}") long expirationMinutes) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters long");
        }
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationSeconds = expirationMinutes * 60;
    }

    public String generateToken(User user) {
        long now = Instant.now().getEpochSecond();
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", user.getEmail());
        claims.put("uid", user.getId());
        claims.put("role", user.getRole().name());
        claims.put("iat", now);
        claims.put("exp", now + expirationSeconds);
        try {
            String payload = ENC.encodeToString(mapper.writeValueAsBytes(claims));
            String unsigned = HEADER + "." + payload;
            return unsigned + "." + sign(unsigned);
        } catch (Exception e) {
            throw new IllegalStateException("Could not create token", e);
        }
    }

    /** Returns the token data, or empty if the token is malformed, tampered with or expired. */
    public Optional<TokenData> parse(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return Optional.empty();
            String expected = sign(parts[0] + "." + parts[1]);
            if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
                return Optional.empty();
            }
            Map<?, ?> claims = mapper.readValue(DEC.decode(parts[1]), Map.class);
            long exp = ((Number) claims.get("exp")).longValue();
            if (Instant.now().getEpochSecond() >= exp) return Optional.empty();
            return Optional.of(new TokenData(((Number) claims.get("uid")).longValue(), (String) claims.get("sub"),
                    Role.valueOf((String) claims.get("role")), exp));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private String sign(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return ENC.encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    }
}
