package com.siddhi.carrental.repository;

import com.siddhi.carrental.entity.Booking;
import com.siddhi.carrental.entity.BookingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"car", "user"})
    List<Booking> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"car", "user"})
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    @EntityGraph(attributePaths = {"car", "user"})
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"car", "user"})
    List<Booking> findTop5ByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"car", "user"})
    Optional<Booking> findWithCarById(Long id);

    long countByStatus(BookingStatus status);

    boolean existsByCarId(Long carId);

    /** true if the car already has a CONFIRMED booking whose dates overlap the given range */
    @Query("""
            select count(b) > 0 from Booking b
            where b.car.id = :carId
              and b.status = com.siddhi.carrental.entity.BookingStatus.CONFIRMED
              and b.id <> :excludeId
              and b.pickupDate <= :returnDate
              and b.returnDate >= :pickupDate
            """)
    boolean existsConfirmedOverlap(@Param("carId") Long carId,
                                   @Param("pickupDate") LocalDate pickupDate,
                                   @Param("returnDate") LocalDate returnDate,
                                   @Param("excludeId") Long excludeId);

    /** rows of [userId, bookingCount] */
    @Query("select b.user.id, count(b) from Booking b where b.user is not null group by b.user.id")
    List<Object[]> countBookingsPerUser();
}
