package com.siddhi.carrental.dto;

import jakarta.validation.constraints.*;

public record CarRequest(
        @NotBlank(message = "Car name is required") @Size(max = 100) String carName,
        @NotBlank(message = "Category is required") @Size(max = 50) String category,
        @NotNull(message = "Seating capacity is required") @Min(value = 1, message = "Seating capacity must be at least 1")
        @Max(value = 60, message = "Seating capacity cannot exceed 60") Integer seatingCapacity,
        @NotBlank(message = "Fuel type is required") @Size(max = 30) String fuelType,
        @NotBlank(message = "Transmission is required") @Size(max = 30) String transmission,
        @Size(max = 255, message = "Image URL is too long") String imageUrl,
        @Size(max = 500, message = "Description cannot exceed 500 characters") String description,
        @Pattern(regexp = "AVAILABLE|UNAVAILABLE|MAINTENANCE",
                message = "Availability must be AVAILABLE, UNAVAILABLE or MAINTENANCE") String availabilityStatus) { }
