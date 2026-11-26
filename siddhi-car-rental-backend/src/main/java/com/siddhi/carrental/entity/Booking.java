package com.siddhi.carrental.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // many bookings -> one car  (FK bookings.car_id -> cars.id)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    // many bookings -> one customer (FK bookings.user_id -> users.id). Null for guest bookings.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "pickup_date", nullable = false)
    private LocalDate pickupDate;
    @Column(name = "pickup_time", nullable = false)
    private LocalTime pickupTime;
    @Column(name = "pickup_location", nullable = false, length = 150)
    private String pickupLocation;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;
    @Column(name = "return_time", nullable = false)
    private LocalTime returnTime;
    @Column(name = "return_location", nullable = false, length = 150)
    private String returnLocation;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;
    @Column(nullable = false, length = 15)
    private String phone;
    @Column(nullable = false, length = 120)
    private String email;

    @Column(name = "travel_type", nullable = false, length = 50)
    private String travelType;
    @Column(name = "additional_requirements", length = 1000)
    private String additionalRequirements;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "admin_remarks", length = 500)
    private String adminRemarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }

    public LocalDateTime pickupDateTime() { return LocalDateTime.of(pickupDate, pickupTime); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }
    public LocalTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalTime pickupTime) { this.pickupTime = pickupTime; }
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
    public LocalTime getReturnTime() { return returnTime; }
    public void setReturnTime(LocalTime returnTime) { this.returnTime = returnTime; }
    public String getReturnLocation() { return returnLocation; }
    public void setReturnLocation(String returnLocation) { this.returnLocation = returnLocation; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTravelType() { return travelType; }
    public void setTravelType(String travelType) { this.travelType = travelType; }
    public String getAdditionalRequirements() { return additionalRequirements; }
    public void setAdditionalRequirements(String additionalRequirements) { this.additionalRequirements = additionalRequirements; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public String getAdminRemarks() { return adminRemarks; }
    public void setAdminRemarks(String adminRemarks) { this.adminRemarks = adminRemarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
