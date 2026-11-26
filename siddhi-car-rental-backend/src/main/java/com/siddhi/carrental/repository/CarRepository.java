package com.siddhi.carrental.repository;

import com.siddhi.carrental.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarRepository extends JpaRepository<Car, Long> {
    List<Car> findAllByOrderByIdAsc();
    List<Car> findByAvailabilityStatusOrderByIdAsc(String availabilityStatus);
    long countByAvailabilityStatus(String availabilityStatus);
}
