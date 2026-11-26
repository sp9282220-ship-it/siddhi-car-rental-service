package com.siddhi.carrental.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "car_name", nullable = false, length = 100)
    private String carName;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "seating_capacity", nullable = false)
    private Integer seatingCapacity;

    @Column(name = "fuel_type", nullable = false, length = 30)
    private String fuelType;

    @Column(nullable = false, length = 30)
    private String transmission;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(length = 500)
    private String description;

    @Column(name = "availability_status", nullable = false, length = 20)
    private String availabilityStatus = "AVAILABLE";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCarName() { return carName; }
    public void setCarName(String carName) { this.carName = carName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getSeatingCapacity() { return seatingCapacity; }
    public void setSeatingCapacity(Integer seatingCapacity) { this.seatingCapacity = seatingCapacity; }
    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }
    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }
}
