package com.siddhi.carrental.controller;

import com.siddhi.carrental.dto.BookingDtos.*;
import com.siddhi.carrental.entity.BookingStatus;
import com.siddhi.carrental.security.AuthUser;
import com.siddhi.carrental.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // POST /api/bookings  (public; linked to the customer's account when a token is sent)
    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest req,
                                                  @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(req, user));
    }

    // GET /api/bookings?status=PENDING  (ADMIN) -> all bookings, optional status filter
    @GetMapping
    public List<BookingResponse> getAll(@RequestParam(required = false) BookingStatus status) {
        return bookingService.getAll(status);
    }

    // GET /api/bookings/my  (CUSTOMER) -> only the logged-in customer's bookings
    @GetMapping("/my")
    public List<BookingResponse> getMine(@AuthenticationPrincipal AuthUser user) {
        return bookingService.getForCustomer(user.id());
    }

    // GET /api/bookings/track?id=5&email=a@b.com  (public status check)
    @GetMapping("/track")
    public BookingResponse track(@RequestParam Long id, @RequestParam String email) {
        return bookingService.track(id, email);
    }

    // GET /api/bookings/{id}  (owner or ADMIN)
    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable Long id, @AuthenticationPrincipal AuthUser user) {
        return bookingService.getById(id, user);
    }

    // PUT /api/bookings/{id}/status  {status, adminRemarks}  (ADMIN)
    @PutMapping("/{id}/status")
    public BookingResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest req) {
        return bookingService.updateStatus(id, req);
    }

    // PUT /api/bookings/{id}/cancel  (owner or ADMIN)
    @PutMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id, @AuthenticationPrincipal AuthUser user) {
        return bookingService.cancel(id, user);
    }
}
