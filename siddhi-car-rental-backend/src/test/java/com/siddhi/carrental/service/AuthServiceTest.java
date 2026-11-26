package com.siddhi.carrental.service;

import com.siddhi.carrental.dto.AuthDtos.AuthResponse;
import com.siddhi.carrental.dto.AuthDtos.LoginRequest;
import com.siddhi.carrental.dto.AuthDtos.RegisterRequest;
import com.siddhi.carrental.entity.Role;
import com.siddhi.carrental.entity.User;
import com.siddhi.carrental.exception.ApiException;
import com.siddhi.carrental.repository.BookingRepository;
import com.siddhi.carrental.repository.UserRepository;
import com.siddhi.carrental.security.JwtUtil;
import com.siddhi.carrental.security.TokenBlacklist;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    UserRepository userRepository = mock(UserRepository.class);
    BookingRepository bookingRepository = mock(BookingRepository.class);
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    JwtUtil jwtUtil = new JwtUtil("unit-test-secret-key-that-is-long-enough-123", 60);
    AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(userRepository, bookingRepository, encoder, jwtUtil, new TokenBlacklist());
    }

    @Test
    void registerEncryptsPasswordAndCreatesCustomer() {
        when(userRepository.existsByEmailIgnoreCase("new@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(7L);
            return u;
        });

        AuthResponse res = service.register(new RegisterRequest("New User", "New@Test.com", "9876543210", "secret123"));

        assertThat(res.token()).isNotBlank();
        assertThat(res.user().role()).isEqualTo(Role.CUSTOMER);
        assertThat(res.user().email()).isEqualTo("new@test.com");
        verify(userRepository).save(argThat(u -> !u.getPassword().equals("secret123") && encoder.matches("secret123", u.getPassword())));
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("dup@test.com")).thenReturn(true);
        assertThatThrownBy(() -> service.register(new RegisterRequest("Dup", "dup@test.com", "9876543210", "secret123")))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void loginChecksPassword() {
        User u = new User();
        u.setId(3L);
        u.setEmail("c@test.com");
        u.setFullName("C");
        u.setRole(Role.CUSTOMER);
        u.setPassword(encoder.encode("rightpass"));
        when(userRepository.findByEmailIgnoreCase("c@test.com")).thenReturn(Optional.of(u));

        assertThat(service.login(new LoginRequest("c@test.com", "rightpass")).token()).isNotBlank();
        assertThatThrownBy(() -> service.login(new LoginRequest("c@test.com", "wrongpass")))
                .hasMessage("Invalid email or password");
    }
}
