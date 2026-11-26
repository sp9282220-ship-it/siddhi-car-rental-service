package com.siddhi.carrental.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siddhi.carrental.exception.ErrorResponse;
import com.siddhi.carrental.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

/**
 * Who may call which API.
 *  - Public: register/login, view cars, create booking, track booking, contact form, testimonials (view + submit)
 *  - ADMIN only: /api/admin/**, car add/update/delete, all bookings, status updates, contact messages, testimonial moderation
 *  - Any logged-in user: everything else (my bookings, profile, cancel own booking...)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final ObjectMapper objectMapper;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, ObjectMapper objectMapper) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.objectMapper = objectMapper;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // stop Spring Boot from also registering the filter as a plain servlet filter (it runs inside security only)
    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtFilterRegistration(JwtAuthFilter filter) {
        FilterRegistrationBean<JwtAuthFilter> reg = new FilterRegistrationBean<>(filter);
        reg.setEnabled(false);
        return reg;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .httpBasic(b -> b.disable())
            .formLogin(f -> f.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) ->
                    writeError(res, 401, "Unauthorized", "Please login to continue", req.getRequestURI()))
                .accessDeniedHandler((req, res, ex) ->
                    writeError(res, 403, "Forbidden", "You do not have permission to perform this action", req.getRequestURI())))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()
                // public
                .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/cars", "/api/cars/*").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/bookings").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/bookings/track").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/testimonials").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/testimonials").permitAll()
                // admin only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/cars").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/cars/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/cars/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/bookings").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/bookings/*/status").hasRole("ADMIN")
                .requestMatchers("/api/contact/**").hasRole("ADMIN")
                .requestMatchers("/api/testimonials/**").hasRole("ADMIN")
                // everything else needs a login
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private void writeError(HttpServletResponse res, int status, String error, String message, String path) throws IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(res.getOutputStream(), ErrorResponse.of(status, error, message, path));
    }
}
