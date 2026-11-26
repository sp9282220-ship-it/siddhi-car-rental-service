package com.siddhi.carrental.repository;

import com.siddhi.carrental.entity.Role;
import com.siddhi.carrental.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByRole(Role role);
    long countByRole(Role role);
    List<User> findByRoleOrderByCreatedAtDesc(Role role);
}
