package com.siddhi.carrental.service;

import com.siddhi.carrental.dto.BookingDtos.BookingRequest;
import com.siddhi.carrental.dto.BookingDtos.BookingResponse;
import com.siddhi.carrental.dto.BookingDtos.StatusUpdateRequest;
import com.siddhi.carrental.entity.*;
import com.siddhi.carrental.exception.ApiException;
import com.siddhi.carrental.repository.BookingRepository;
import com.siddhi.carrental.repository.CarRepository;
import com.siddhi.carrental.repository.UserRepository;
import com.siddhi.carrental.security.AuthUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock BookingRepository bookingRepository;
    @Mock CarRepository carRepository;
    @Mock UserRepository userRepository;
    @InjectMocks BookingService service;

    Car car;
    final AuthUser customer = new AuthUser(10L, "c@test.com", "Customer", Role.CUSTOMER);
    final AuthUser otherCustomer = new AuthUser(11L, "o@test.com", "Other", Role.CUSTOMER);
    final AuthUser admin = new AuthUser(1L, "admin@test.com", "Admin", Role.ADMIN);

    @BeforeEach
    void setUp() {
        car = new Car();
        car.setId(1L);
        car.setCarName("Ertiga");
        car.setCategory("SUV");
        car.setAvailabilityStatus("AVAILABLE");
    }

    private BookingRequest request(LocalDate pickup, LocalTime pickupTime, LocalDate ret, LocalTime retTime) {
        return new BookingRequest(1L, pickup, pickupTime, "Kharadi, Pune - 411014", ret, retTime,
                "Kharadi, Pune - 411014", "Test User", "9876543210", "Test@Mail.com", "Local", null);
    }

    private Booking existing(Long ownerId, BookingStatus status) {
        Booking b = new Booking();
        b.setId(5L);
        b.setCar(car);
        if (ownerId != null) {
            User u = new User();
            u.setId(ownerId);
            b.setUser(u);
        }
        b.setPickupDate(LocalDate.now().plusDays(3));
        b.setPickupTime(LocalTime.of(10, 0));
        b.setReturnDate(LocalDate.now().plusDays(4));
        b.setReturnTime(LocalTime.of(10, 0));
        b.setStatus(status);
        b.setEmail("c@test.com");
        return b;
    }

    @Test
    void createSavesPendingBookingLinkedToCustomer() {
        when(carRepository.findById(1L)).thenReturn(Optional.of(car));
        when(bookingRepository.existsConfirmedOverlap(anyLong(), any(), any(), anyLong())).thenReturn(false);
        User ref = new User();
        ref.setId(10L);
        when(userRepository.getReferenceById(10L)).thenReturn(ref);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setId(99L);
            return b;
        });

        LocalDate d = LocalDate.now().plusDays(2);
        BookingResponse res = service.create(request(d, LocalTime.of(9, 0), d.plusDays(1), LocalTime.of(9, 0)), customer);

        assertThat(res.id()).isEqualTo(99L);
        assertThat(res.status()).isEqualTo(BookingStatus.PENDING);
        assertThat(res.userId()).isEqualTo(10L);
        assertThat(res.email()).isEqualTo("test@mail.com");
    }

    @Test
    void createRejectsReturnBeforePickup() {
        when(carRepository.findById(1L)).thenReturn(Optional.of(car));
        LocalDate d = LocalDate.now().plusDays(2);
        assertThatThrownBy(() -> service.create(request(d, LocalTime.of(12, 0), d, LocalTime.of(11, 0)), null))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Return date and time must be after");
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createRejectsPastPickup() {
        when(carRepository.findById(1L)).thenReturn(Optional.of(car));
        LocalDate past = LocalDate.now().minusDays(1);
        assertThatThrownBy(() -> service.create(request(past, LocalTime.of(9, 0), past.plusDays(3), LocalTime.of(9, 0)), null))
                .hasMessageContaining("cannot be in the past");
    }

    @Test
    void createRejectsUnavailableCar() {
        car.setAvailabilityStatus("MAINTENANCE");
        when(carRepository.findById(1L)).thenReturn(Optional.of(car));
        LocalDate d = LocalDate.now().plusDays(2);
        assertThatThrownBy(() -> service.create(request(d, LocalTime.of(9, 0), d.plusDays(1), LocalTime.of(9, 0)), null))
                .hasMessageContaining("not available");
    }

    @Test
    void createRejectsOverlapWithConfirmedBooking() {
        when(carRepository.findById(1L)).thenReturn(Optional.of(car));
        when(bookingRepository.existsConfirmedOverlap(anyLong(), any(), any(), anyLong())).thenReturn(true);
        LocalDate d = LocalDate.now().plusDays(2);
        assertThatThrownBy(() -> service.create(request(d, LocalTime.of(9, 0), d.plusDays(1), LocalTime.of(9, 0)), null))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void customerCannotViewAnotherCustomersBooking() {
        when(bookingRepository.findWithCarById(5L)).thenReturn(Optional.of(existing(10L, BookingStatus.PENDING)));
        assertThatThrownBy(() -> service.getById(5L, otherCustomer))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void ownerAndAdminCanViewBooking() {
        when(bookingRepository.findWithCarById(5L)).thenReturn(Optional.of(existing(10L, BookingStatus.PENDING)));
        assertThat(service.getById(5L, customer).id()).isEqualTo(5L);
        assertThat(service.getById(5L, admin).id()).isEqualTo(5L);
    }

    @Test
    void customerCanCancelOwnPendingBooking() {
        when(bookingRepository.findWithCarById(5L)).thenReturn(Optional.of(existing(10L, BookingStatus.PENDING)));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
        assertThat(service.cancel(5L, customer).status()).isEqualTo(BookingStatus.CANCELLED);
    }

    @Test
    void cannotCancelAnotherCustomersBooking() {
        when(bookingRepository.findWithCarById(5L)).thenReturn(Optional.of(existing(10L, BookingStatus.PENDING)));
        assertThatThrownBy(() -> service.cancel(5L, otherCustomer)).hasMessageContaining("not allowed");
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cannotCancelRejectedBooking() {
        when(bookingRepository.findWithCarById(5L)).thenReturn(Optional.of(existing(10L, BookingStatus.REJECTED)));
        assertThatThrownBy(() -> service.cancel(5L, customer)).hasMessageContaining("Only PENDING or CONFIRMED");
    }

    @Test
    void adminConfirmsPendingBooking() {
        when(bookingRepository.findWithCarById(5L)).thenReturn(Optional.of(existing(10L, BookingStatus.PENDING)));
        when(bookingRepository.existsConfirmedOverlap(anyLong(), any(), any(), anyLong())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
        BookingResponse res = service.updateStatus(5L, new StatusUpdateRequest(BookingStatus.CONFIRMED, "Driver assigned"));
        assertThat(res.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(res.adminRemarks()).isEqualTo("Driver assigned");
    }

    @Test
    void finalStatusCannotChange() {
        when(bookingRepository.findWithCarById(5L)).thenReturn(Optional.of(existing(10L, BookingStatus.CANCELLED)));
        assertThatThrownBy(() -> service.updateStatus(5L, new StatusUpdateRequest(BookingStatus.CONFIRMED, null)))
                .hasMessageContaining("cannot be changed");
    }

    @Test
    void trackRequiresMatchingEmail() {
        when(bookingRepository.findWithCarById(5L)).thenReturn(Optional.of(existing(10L, BookingStatus.PENDING)));
        assertThat(service.track(5L, "C@TEST.com").id()).isEqualTo(5L);
        assertThatThrownBy(() -> service.track(5L, "wrong@test.com")).hasMessageContaining("No booking found");
    }
}
