package com.siddhi.carrental.entity;

public enum BookingStatus {
    PENDING, CONFIRMED, REJECTED, CANCELLED, COMPLETED;

    // a booking in one of these states can no longer change
    public boolean isFinal() {
        return this == REJECTED || this == CANCELLED || this == COMPLETED;
    }
}
