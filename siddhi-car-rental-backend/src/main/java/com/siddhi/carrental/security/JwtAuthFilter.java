package com.siddhi.carrental.security;

import com.siddhi.carrental.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/** Reads "Authorization: Bearer <token>" and, if valid, marks the request as logged in. */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenBlacklist blacklist;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, TokenBlacklist blacklist, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.blacklist = blacklist;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            if (!blacklist.isRevoked(token)) {
                jwtUtil.parse(token)
                        // re-read the user so deleted accounts / changed roles take effect immediately
                        .flatMap(data -> userRepository.findById(data.userId()))
                        .ifPresent(user -> {
                            AuthUser principal = new AuthUser(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
                            var auth = new UsernamePasswordAuthenticationToken(principal, token,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        });
            }
        }
        chain.doFilter(request, response);
    }
}
