package com.siddhi.carrental.service;

import com.siddhi.carrental.dto.CarRequest;
import com.siddhi.carrental.entity.Car;
import com.siddhi.carrental.exception.ApiException;
import com.siddhi.carrental.repository.BookingRepository;
import com.siddhi.carrental.repository.CarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CarService {

    public static final String AVAILABLE = "AVAILABLE";

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;

    public CarService(CarRepository carRepository, BookingRepository bookingRepository) {
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Car> getAllCars() {
        return carRepository.findAllByOrderByIdAsc();
    }

    public List<Car> getAvailableCars() {
        return carRepository.findByAvailabilityStatusOrderByIdAsc(AVAILABLE);
    }

    public Car getCar(Long id) {
        return carRepository.findById(id).orElseThrow(() -> ApiException.notFound("Car not found with id " + id));
    }

    @Transactional
    public Car addCar(CarRequest req) {
        Car car = new Car();
        apply(car, req);
        return carRepository.save(car);
    }

    @Transactional
    public Car updateCar(Long id, CarRequest req) {
        Car car = getCar(id);
        apply(car, req);
        return carRepository.save(car);
    }

    @Transactional
    public void deleteCar(Long id) {
        Car car = getCar(id);
        if (bookingRepository.existsByCarId(id)) {
            throw ApiException.conflict("This car has bookings and cannot be deleted. Mark it UNAVAILABLE instead.");
        }
        carRepository.delete(car);
    }

    private void apply(Car car, CarRequest req) {
        car.setCarName(req.carName().trim());
        car.setCategory(req.category().trim());
        car.setSeatingCapacity(req.seatingCapacity());
        car.setFuelType(req.fuelType().trim());
        car.setTransmission(req.transmission().trim());
        car.setImageUrl(blankToNull(req.imageUrl()));
        car.setDescription(blankToNull(req.description()));
        car.setAvailabilityStatus(req.availabilityStatus() == null || req.availabilityStatus().isBlank()
                ? AVAILABLE : req.availabilityStatus());
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
