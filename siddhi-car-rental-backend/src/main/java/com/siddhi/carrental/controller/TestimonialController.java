package com.siddhi.carrental.controller;

import com.siddhi.carrental.dto.MiscDtos.ApprovalRequest;
import com.siddhi.carrental.dto.MiscDtos.MessageResponse;
import com.siddhi.carrental.dto.MiscDtos.TestimonialRequest;
import com.siddhi.carrental.entity.Testimonial;
import com.siddhi.carrental.security.AuthUser;
import com.siddhi.carrental.service.TestimonialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/testimonials")
public class TestimonialController {

    private final TestimonialService service;

    public TestimonialController(TestimonialService service) {
        this.service = service;
    }

    // GET /api/testimonials  (public) -> approved reviews only
    @GetMapping
    public List<Testimonial> getApproved() {
        return service.getApproved();
    }

    // POST /api/testimonials  (public) -> saved as "waiting for approval"
    @PostMapping
    public ResponseEntity<Testimonial> submit(@Valid @RequestBody TestimonialRequest req,
                                              @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submit(req, user));
    }

    // GET /api/testimonials/all  (ADMIN)
    @GetMapping("/all")
    public List<Testimonial> getAll() {
        return service.getAll();
    }

    // PUT /api/testimonials/{id}/approval  {approved: true|false}  (ADMIN)
    @PutMapping("/{id}/approval")
    public Testimonial setApproval(@PathVariable Long id, @Valid @RequestBody ApprovalRequest req) {
        return service.setApproved(id, req.approved());
    }

    // DELETE /api/testimonials/{id}  (ADMIN)
    @DeleteMapping("/{id}")
    public MessageResponse delete(@PathVariable Long id) {
        service.delete(id);
        return new MessageResponse("Testimonial deleted");
    }
}
