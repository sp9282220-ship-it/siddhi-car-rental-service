package com.siddhi.carrental.service;

import com.siddhi.carrental.dto.MiscDtos.TestimonialRequest;
import com.siddhi.carrental.entity.Role;
import com.siddhi.carrental.entity.Testimonial;
import com.siddhi.carrental.exception.ApiException;
import com.siddhi.carrental.repository.TestimonialRepository;
import com.siddhi.carrental.repository.UserRepository;
import com.siddhi.carrental.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TestimonialService {

    private final TestimonialRepository repository;
    private final UserRepository userRepository;

    public TestimonialService(TestimonialRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    /** New reviews wait for admin approval before they appear on the website. */
    @Transactional
    public Testimonial submit(TestimonialRequest req, AuthUser authUser) {
        Testimonial t = new Testimonial();
        t.setCustomerName(req.customerName().trim());
        t.setRating(req.rating());
        t.setMessage(req.message().trim());
        t.setApproved(false);
        if (authUser != null && authUser.role() == Role.CUSTOMER) {
            t.setUser(userRepository.getReferenceById(authUser.id()));
        }
        return repository.save(t);
    }

    public List<Testimonial> getApproved() {
        return repository.findByApprovedTrueOrderByCreatedAtDesc();
    }

    public List<Testimonial> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Testimonial setApproved(Long id, boolean approved) {
        Testimonial t = find(id);
        t.setApproved(approved);
        return repository.save(t);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(find(id));
    }

    private Testimonial find(Long id) {
        return repository.findById(id).orElseThrow(() -> ApiException.notFound("Testimonial not found with id " + id));
    }
}
