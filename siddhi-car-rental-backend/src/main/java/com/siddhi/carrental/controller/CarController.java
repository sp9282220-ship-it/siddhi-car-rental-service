package com.siddhi.carrental.controller;

import com.siddhi.carrental.dto.CarRequest;
import com.siddhi.carrental.dto.MiscDtos.MessageResponse;
import com.siddhi.carrental.entity.Car;
import com.siddhi.carrental.service.CarService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cars")
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    // GET http://localhost:8080/api/cars            -> all cars
    // GET http://localhost:8080/api/cars?available=true -> only cars that can be booked
    @GetMapping
    public List<Car> getAllCars(@RequestParam(defaultValue = "false") boolean available) {
        return available ? carService.getAvailableCars() : carService.getAllCars();
    }

    // GET /api/cars/{id}
    @GetMapping("/{id}")
    public Car getCar(@PathVariable Long id) {
        return carService.getCar(id);
    }

    // POST /api/cars  (ADMIN)
    @PostMapping
    public ResponseEntity<Car> addCar(@Valid @RequestBody CarRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(carService.addCar(req));
    }

    // PUT /api/cars/{id}  (ADMIN)
    @PutMapping("/{id}")
    public Car updateCar(@PathVariable Long id, @Valid @RequestBody CarRequest req) {
        return carService.updateCar(id, req);
    }

    // DELETE /api/cars/{id}  (ADMIN)
    @DeleteMapping("/{id}")
    public MessageResponse deleteCar(@PathVariable Long id) {
        carService.deleteCar(id);
        return new MessageResponse("Car deleted successfully");
    }
}
