package com.siddhi.carrental.service;

import com.siddhi.carrental.dto.AuthDtos.*;
import com.siddhi.carrental.entity.Role;
import com.siddhi.carrental.entity.User;
import com.siddhi.carrental.exception.ApiException;
import com.siddhi.carrental.repository.BookingRepository;
import com.siddhi.carrental.repository.UserRepository;
import com.siddhi.carrental.security.JwtUtil;
import com.siddhi.carrental.security.TokenBlacklist;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklist blacklist;

    public AuthService(UserRepository userRepository, BookingRepository bookingRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil, TokenBlacklist blacklist) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.blacklist = blacklist;
    }

    /** New accounts are always CUSTOMER. Admins cannot be created through the public API. */
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("An account with this email already exists. Please login.");
        }
        User user = new User();
        user.setFullName(req.fullName().trim());
        user.setEmail(email);
        user.setPhone(req.phone().trim());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(Role.CUSTOMER);
        user = userRepository.save(user);
        return new AuthResponse(jwtUtil.generateToken(user), UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailIgnoreCase(req.email().trim())
                .filter(u -> passwordEncoder.matches(req.password(), u.getPassword()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        return new AuthResponse(jwtUtil.generateToken(user), UserResponse.from(user));
    }

    public void logout(String token) {
        if (token == null) return;
        jwtUtil.parse(token).ifPresent(data -> blacklist.revoke(token, data.expiresAt()));
    }

    public UserResponse getProfile(Long userId) {
        return UserResponse.from(findUser(userId));
    }

    @Transactional
    public UserResponse updateProfile(Long userId, ProfileUpdateRequest req) {
        User user = findUser(userId);
        user.setFullName(req.fullName().trim());
        user.setPhone(req.phone().trim());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        User user = findUser(userId);
        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            throw ApiException.badRequest("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    /** For the admin "Customers" tab: every customer with how many bookings they made. */
    public List<UserResponse> getCustomers() {
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : bookingRepository.countBookingsPerUser()) {
            counts.put((Long) row[0], (Long) row[1]);
        }
        return userRepository.findByRoleOrderByCreatedAtDesc(Role.CUSTOMER).stream()
                .map(u -> UserResponse.from(u, counts.getOrDefault(u.getId(), 0L)))
                .toList();
    }

    private User findUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
    }
}
