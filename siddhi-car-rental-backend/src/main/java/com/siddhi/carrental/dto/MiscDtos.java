package com.siddhi.carrental.dto;

import jakarta.validation.constraints.*;

import java.util.List;

/** Small request / response objects for contact, testimonials and the dashboard. */
public final class MiscDtos {

    private MiscDtos() { }

    public record MessageResponse(String message) { }

    public record ContactRequest(
            @NotBlank(message = "Name is required") @Size(max = 100) String name,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") @Size(max = 120) String email,
            @NotBlank(message = "Message is required") @Size(max = 2000, message = "Message cannot exceed 2000 characters") String message) { }

    public record TestimonialRequest(
            @NotBlank(message = "Name is required") @Size(max = 100) String customerName,
            @NotNull(message = "Rating is required") @Min(value = 1, message = "Rating must be between 1 and 5")
            @Max(value = 5, message = "Rating must be between 1 and 5") Integer rating,
            @NotBlank(message = "Review message is required") @Size(min = 10, max = 1000, message = "Review must be 10-1000 characters") String message) { }

    public record ApprovalRequest(@NotNull(message = "approved is required") Boolean approved) { }

    public record DashboardStats(
            long totalCars, long availableCars,
            long totalBookings, long pendingBookings, long confirmedBookings,
            long completedBookings, long cancelledBookings, long rejectedBookings,
            long totalCustomers, long unreadMessages, long pendingTestimonials,
            List<BookingDtos.BookingResponse> recentBookings) { }
}
