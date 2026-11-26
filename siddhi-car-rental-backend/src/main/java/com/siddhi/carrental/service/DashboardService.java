package com.siddhi.carrental.service;

import com.siddhi.carrental.dto.BookingDtos.BookingResponse;
import com.siddhi.carrental.dto.MiscDtos.DashboardStats;
import com.siddhi.carrental.entity.BookingStatus;
import com.siddhi.carrental.entity.Role;
import com.siddhi.carrental.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ContactMessageRepository contactRepository;
    private final TestimonialRepository testimonialRepository;

    public DashboardService(CarRepository carRepository, BookingRepository bookingRepository, UserRepository userRepository,
                            ContactMessageRepository contactRepository, TestimonialRepository testimonialRepository) {
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
        this.testimonialRepository = testimonialRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStats getStats() {
        return new DashboardStats(
                carRepository.count(),
                carRepository.countByAvailabilityStatus(CarService.AVAILABLE),
                bookingRepository.count(),
                bookingRepository.countByStatus(BookingStatus.PENDING),
                bookingRepository.countByStatus(BookingStatus.CONFIRMED),
                bookingRepository.countByStatus(BookingStatus.COMPLETED),
                bookingRepository.countByStatus(BookingStatus.CANCELLED),
                bookingRepository.countByStatus(BookingStatus.REJECTED),
                userRepository.countByRole(Role.CUSTOMER),
                contactRepository.countByReadFalse(),
                testimonialRepository.countByApprovedFalse(),
                bookingRepository.findTop5ByOrderByCreatedAtDesc().stream().map(BookingResponse::from).toList());
    }
}
