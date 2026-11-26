package com.siddhi.carrental.repository;

import com.siddhi.carrental.entity.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
    List<Testimonial> findByApprovedTrueOrderByCreatedAtDesc();
    List<Testimonial> findAllByOrderByCreatedAtDesc();
    long countByApprovedFalse();
}
