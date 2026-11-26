package com.siddhi.carrental.service;

import com.siddhi.carrental.dto.BookingDtos.*;
import com.siddhi.carrental.entity.*;
import com.siddhi.carrental.exception.ApiException;
import com.siddhi.carrental.repository.BookingRepository;
import com.siddhi.carrental.repository.CarRepository;
import com.siddhi.carrental.repository.UserRepository;
import com.siddhi.carrental.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, CarRepository carRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
    }

    /**
     * Saves a booking. Guests may book too; when a customer is logged in the booking is linked
     * to their account so it appears in their dashboard.
     */
    @Transactional
    public BookingResponse create(BookingRequest req, AuthUser authUser) {
        Car car = carRepository.findById(req.carId())
                .orElseThrow(() -> ApiException.notFound("Selected car does not exist"));
        if (!CarService.AVAILABLE.equals(car.getAvailabilityStatus())) {
            throw ApiException.badRequest(car.getCarName() + " is currently not available for booking");
        }

        LocalDateTime pickup = LocalDateTime.of(req.pickupDate(), req.pickupTime());
        LocalDateTime ret = LocalDateTime.of(req.returnDate(), req.returnTime());
        if (pickup.isBefore(LocalDateTime.now())) {
            throw ApiException.badRequest("Pickup date and time cannot be in the past");
        }
        if (!ret.isAfter(pickup)) {
            throw ApiException.badRequest("Return date and time must be after the pickup date and time");
        }
        if (bookingRepository.existsConfirmedOverlap(car.getId(), req.pickupDate(), req.returnDate(), -1L)) {
            throw ApiException.conflict(car.getCarName() + " is already booked for the selected dates. Please choose other dates or another car.");
        }

        Booking b = new Booking();
        b.setCar(car);
        if (authUser != null && authUser.role() == Role.CUSTOMER) {
            b.setUser(userRepository.getReferenceById(authUser.id()));
        }
        b.setPickupDate(req.pickupDate());
        b.setPickupTime(req.pickupTime());
        b.setPickupLocation(req.pickupLocation().trim());
        b.setReturnDate(req.returnDate());
        b.setReturnTime(req.returnTime());
        b.setReturnLocation(req.returnLocation().trim());
        b.setCustomerName(req.customerName().trim());
        b.setPhone(req.phone().trim());
        b.setEmail(req.email().trim().toLowerCase());
        b.setTravelType(req.travelType().trim());
        b.setAdditionalRequirements(req.additionalRequirements() == null || req.additionalRequirements().isBlank()
                ? null : req.additionalRequirements().trim());
        b.setStatus(BookingStatus.PENDING);
        return BookingResponse.from(bookingRepository.save(b));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAll(BookingStatus status) {
        List<Booking> list = status == null
                ? bookingRepository.findAllByOrderByCreatedAtDesc()
                : bookingRepository.findByStatusOrderByCreatedAtDesc(status);
        return list.stream().map(BookingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getForCustomer(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(BookingResponse::from).toList();
    }

    /** Admin sees any booking; a customer only sees their own. */
    @Transactional(readOnly = true)
    public BookingResponse getById(Long id, AuthUser authUser) {
        Booking b = find(id);
        checkOwnerOrAdmin(b, authUser);
        return BookingResponse.from(b);
    }

    /** Public booking-status check: needs both the booking ID and the email used for the booking. */
    @Transactional(readOnly = true)
    public BookingResponse track(Long id, String email) {
        return bookingRepository.findWithCarById(id)
                .filter(b -> b.getEmail().equalsIgnoreCase(email == null ? "" : email.trim()))
                .map(BookingResponse::from)
                .orElseThrow(() -> ApiException.notFound("No booking found with this booking ID and email"));
    }

    @Transactional
    public BookingResponse updateStatus(Long id, StatusUpdateRequest req) {
        Booking b = find(id);
        BookingStatus next = req.status();
        if (b.getStatus().isFinal()) {
            throw ApiException.badRequest("Booking is already " + b.getStatus() + " and cannot be changed");
        }
        if (next == BookingStatus.PENDING) {
            throw ApiException.badRequest("A booking cannot be moved back to PENDING");
        }
        if (next == BookingStatus.COMPLETED && b.getStatus() != BookingStatus.CONFIRMED) {
            throw ApiException.badRequest("Only CONFIRMED bookings can be marked COMPLETED");
        }
        if (next == BookingStatus.CONFIRMED && bookingRepository.existsConfirmedOverlap(
                b.getCar().getId(), b.getPickupDate(), b.getReturnDate(), b.getId())) {
            throw ApiException.conflict("Another CONFIRMED booking already uses " + b.getCar().getCarName() + " on these dates");
        }
        b.setStatus(next);
        if (req.adminRemarks() != null) {
            b.setAdminRemarks(req.adminRemarks().isBlank() ? null : req.adminRemarks().trim());
        }
        return BookingResponse.from(bookingRepository.save(b));
    }

    /** Customers can cancel their own PENDING/CONFIRMED booking before the pickup time. */
    @Transactional
    public BookingResponse cancel(Long id, AuthUser authUser) {
        Booking b = find(id);
        checkOwnerOrAdmin(b, authUser);
        if (b.getStatus() != BookingStatus.PENDING && b.getStatus() != BookingStatus.CONFIRMED) {
            throw ApiException.badRequest("Only PENDING or CONFIRMED bookings can be cancelled (current status: " + b.getStatus() + ")");
        }
        if (!authUser.isAdmin() && !b.pickupDateTime().isAfter(LocalDateTime.now())) {
            throw ApiException.badRequest("This booking can no longer be cancelled because the pickup time has passed");
        }
        b.setStatus(BookingStatus.CANCELLED);
        return BookingResponse.from(bookingRepository.save(b));
    }

    private Booking find(Long id) {
        return bookingRepository.findWithCarById(id)
                .orElseThrow(() -> ApiException.notFound("Booking not found with id " + id));
    }

    private void checkOwnerOrAdmin(Booking b, AuthUser authUser) {
        if (authUser == null) throw ApiException.unauthorized("Please login to continue");
        if (authUser.isAdmin()) return;
        Long ownerId = b.getUser() == null ? null : b.getUser().getId();
        if (!Objects.equals(ownerId, authUser.id())) {
            throw ApiException.forbidden("You are not allowed to access this booking");
        }
    }
}
