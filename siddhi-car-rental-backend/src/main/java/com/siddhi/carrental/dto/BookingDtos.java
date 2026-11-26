package com.siddhi.carrental.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.siddhi.carrental.entity.Booking;
import com.siddhi.carrental.entity.BookingStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public final class BookingDtos {

    private BookingDtos() { }

    public record BookingRequest(
            @NotNull(message = "Please select a car") Long carId,
            @NotNull(message = "Pickup date is required") LocalDate pickupDate,
            @NotNull(message = "Pickup time is required") @JsonFormat(pattern = "HH:mm[:ss]") LocalTime pickupTime,
            @NotBlank(message = "Pickup location is required") @Size(max = 150) String pickupLocation,
            @NotNull(message = "Return date is required") LocalDate returnDate,
            @NotNull(message = "Return time is required") @JsonFormat(pattern = "HH:mm[:ss]") LocalTime returnTime,
            @NotBlank(message = "Return location is required") @Size(max = 150) String returnLocation,
            @NotBlank(message = "Customer name is required") @Size(max = 100) String customerName,
            @NotBlank(message = "Mobile number is required")
            @Pattern(regexp = AuthDtos.PHONE_REGEX, message = AuthDtos.PHONE_MESSAGE) String phone,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") @Size(max = 120) String email,
            @NotBlank(message = "Travel type is required") @Size(max = 50) String travelType,
            @Size(max = 1000, message = "Additional requirements cannot exceed 1000 characters") String additionalRequirements) { }

    public record StatusUpdateRequest(
            @NotNull(message = "Status is required") BookingStatus status,
            @Size(max = 500, message = "Remarks cannot exceed 500 characters") String adminRemarks) { }

    public record BookingResponse(
            Long id, Long carId, String carName, String carCategory, String carImageUrl,
            Long userId,
            LocalDate pickupDate, @JsonFormat(pattern = "HH:mm") LocalTime pickupTime, String pickupLocation,
            LocalDate returnDate, @JsonFormat(pattern = "HH:mm") LocalTime returnTime, String returnLocation,
            String customerName, String phone, String email, String travelType, String additionalRequirements,
            BookingStatus status, String adminRemarks, LocalDateTime createdAt, LocalDateTime updatedAt) {

        public static BookingResponse from(Booking b) {
            return new BookingResponse(b.getId(), b.getCar().getId(), b.getCar().getCarName(),
                    b.getCar().getCategory(), b.getCar().getImageUrl(),
                    b.getUser() == null ? null : b.getUser().getId(),
                    b.getPickupDate(), b.getPickupTime(), b.getPickupLocation(),
                    b.getReturnDate(), b.getReturnTime(), b.getReturnLocation(),
                    b.getCustomerName(), b.getPhone(), b.getEmail(), b.getTravelType(), b.getAdditionalRequirements(),
                    b.getStatus(), b.getAdminRemarks(), b.getCreatedAt(), b.getUpdatedAt());
        }
    }
}
