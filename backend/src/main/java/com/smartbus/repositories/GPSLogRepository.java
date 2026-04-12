package com.smartbus.repositories;

import com.smartbus.models.GPSLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GPSLogRepository extends JpaRepository<GPSLog, Long> {
    List<GPSLog> findByBusIdOrderByTimestampDesc(Long busId);
    Optional<GPSLog> findTopByBusIdOrderByTimestampDesc(Long busId);
    List<GPSLog> findByBusIdAndTimestampBetweenOrderByTimestampAsc(Long busId, LocalDateTime start, LocalDateTime end);
}
