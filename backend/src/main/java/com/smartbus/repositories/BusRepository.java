package com.smartbus.repositories;

import com.smartbus.models.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
    Optional<Bus> findByBusNumber(String busNumber);
    List<Bus> findByStatus(Bus.BusStatus status);
    List<Bus> findByDriverId(Long driverId);
    List<Bus> findByAssignedRouteId(Long routeId);
    boolean existsByBusNumber(String busNumber);
}
