package com.siddhi.carrental.dto;

import com.siddhi.carrental.entity.Role;
import com.siddhi.carrental.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/** Request / response objects for login, registration and profile. */
public final class AuthDtos {

    private AuthDtos() { }

    public static final String PHONE_REGEX = "^[6-9]\\d{9}$";
    public static final String PHONE_MESSAGE = "Enter a valid 10-digit mobile number";

    public record RegisterRequest(
            @NotBlank(message = "Full name is required") @Size(max = 100) String fullName,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") @Size(max = 120) String email,
            @NotBlank(message = "Mobile number is required") @Pattern(regexp = PHONE_REGEX, message = PHONE_MESSAGE) String phone,
            @NotBlank(message = "Password is required") @Size(min = 6, max = 64, message = "Password must be 6-64 characters") String password) { }

    public record LoginRequest(
            @NotBlank(message = "Email is required") String email,
            @NotBlank(message = "Password is required") String password) { }

    public record ProfileUpdateRequest(
            @NotBlank(message = "Full name is required") @Size(max = 100) String fullName,
            @NotBlank(message = "Mobile number is required") @Pattern(regexp = PHONE_REGEX, message = PHONE_MESSAGE) String phone) { }

    public record ChangePasswordRequest(
            @NotBlank(message = "Current password is required") String currentPassword,
            @NotBlank(message = "New password is required") @Size(min = 6, max = 64, message = "Password must be 6-64 characters") String newPassword) { }

    public record UserResponse(Long id, String fullName, String email, String phone, Role role,
                               LocalDateTime createdAt, Long bookingCount) {
        public static UserResponse from(User u) { return from(u, null); }

        public static UserResponse from(User u, Long bookingCount) {
            return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRole(),
                    u.getCreatedAt(), bookingCount);
        }
    }

    public record AuthResponse(String token, UserResponse user) { }
}
