package com.siddhi.carrental.controller;

import com.siddhi.carrental.dto.AuthDtos.UserResponse;
import com.siddhi.carrental.dto.MiscDtos.DashboardStats;
import com.siddhi.carrental.service.AuthService;
import com.siddhi.carrental.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Everything under /api/admin requires the ADMIN role (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DashboardService dashboardService;
    private final AuthService authService;

    public AdminController(DashboardService dashboardService, AuthService authService) {
        this.dashboardService = dashboardService;
        this.authService = authService;
    }

    // GET /api/admin/dashboard -> counts + 5 most recent bookings
    @GetMapping("/dashboard")
    public DashboardStats dashboard() {
        return dashboardService.getStats();
    }

    // GET /api/admin/customers -> registered customers with their booking count
    @GetMapping("/customers")
    public List<UserResponse> customers() {
        return authService.getCustomers();
    }
}
