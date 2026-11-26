package com.siddhi.carrental.config;

import com.siddhi.carrental.entity.Role;
import com.siddhi.carrental.entity.User;
import com.siddhi.carrental.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Makes sure a demo admin account exists (values from application.properties). */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name}") private String adminName;
    @Value("${app.admin.email}") private String adminEmail;
    @Value("${app.admin.password}") private String adminPassword;
    @Value("${app.admin.phone}") private String adminPhone;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.ADMIN)) return;
        User admin = new User();
        admin.setFullName(adminName);
        admin.setEmail(adminEmail.toLowerCase());
        admin.setPhone(adminPhone);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        log.info("Created default admin account: {}", adminEmail);
    }
}
