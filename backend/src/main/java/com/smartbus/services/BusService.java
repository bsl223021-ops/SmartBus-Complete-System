package com.smartbus.services;

import com.smartbus.dto.BusDto;
import com.smartbus.exceptions.CustomException;
import com.smartbus.exceptions.ResourceNotFoundException;
import com.smartbus.models.Bus;
import com.smartbus.models.Route;
import com.smartbus.models.User;
import com.smartbus.repositories.BusRepository;
import com.smartbus.repositories.RouteRepository;
import com.smartbus.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusService {

    private final BusRepository busRepository;
    private final UserRepository userRepository;
    private final RouteRepository routeRepository;

    public List<BusDto> getAllBuses() {
        return busRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public BusDto getBusById(Long id) {
        return toDto(busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", id)));
    }

    public BusDto createBus(BusDto dto) {
        if (busRepository.existsByBusNumber(dto.getBusNumber())) {
            throw new CustomException("Bus with number " + dto.getBusNumber() + " already exists",
                    HttpStatus.CONFLICT);
        }
        Bus bus = toEntity(dto);
        return toDto(busRepository.save(bus));
    }

    public BusDto updateBus(Long id, BusDto dto) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", id));

        bus.setBusModel(dto.getBusModel());
        bus.setCapacity(dto.getCapacity());

        if (dto.getStatus() != null) {
            bus.setStatus(Bus.BusStatus.valueOf(dto.getStatus().toUpperCase()));
        }

        if (dto.getDriverId() != null) {
            User driver = userRepository.findById(dto.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver", dto.getDriverId()));
            bus.setDriver(driver);
        } else {
            bus.setDriver(null);
        }

        if (dto.getRouteId() != null) {
            Route route = routeRepository.findById(dto.getRouteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Route", dto.getRouteId()));
            bus.setAssignedRoute(route);
        } else {
            bus.setAssignedRoute(null);
        }

        return toDto(busRepository.save(bus));
    }

    public void deleteBus(Long id) {
        if (!busRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bus", id);
        }
        busRepository.deleteById(id);
    }

    public BusDto updateBusLocation(Long id, Double latitude, Double longitude) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", id));
        bus.setCurrentLatitude(latitude);
        bus.setCurrentLongitude(longitude);
        bus.setLastLocationUpdate(System.currentTimeMillis());
        return toDto(busRepository.save(bus));
    }

    public BusDto updateBusStatus(Long id, String status) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", id));
        bus.setStatus(Bus.BusStatus.valueOf(status.toUpperCase()));
        return toDto(busRepository.save(bus));
    }

    public List<BusDto> getBusesByStatus(String status) {
        Bus.BusStatus busStatus = Bus.BusStatus.valueOf(status.toUpperCase());
        return busRepository.findByStatus(busStatus).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public BusDto toDto(Bus bus) {
        BusDto dto = new BusDto();
        dto.setId(bus.getId());
        dto.setBusNumber(bus.getBusNumber());
        dto.setBusModel(bus.getBusModel());
        dto.setCapacity(bus.getCapacity());
        dto.setStatus(bus.getStatus().name());
        dto.setCurrentLatitude(bus.getCurrentLatitude());
        dto.setCurrentLongitude(bus.getCurrentLongitude());
        dto.setLastLocationUpdate(bus.getLastLocationUpdate());
        if (bus.getDriver() != null) {
            dto.setDriverId(bus.getDriver().getId());
            dto.setDriverName(bus.getDriver().getFullName());
        }
        if (bus.getAssignedRoute() != null) {
            dto.setRouteId(bus.getAssignedRoute().getId());
            dto.setRouteName(bus.getAssignedRoute().getRouteName());
        }
        return dto;
    }

    private Bus toEntity(BusDto dto) {
        Bus bus = new Bus();
        bus.setBusNumber(dto.getBusNumber());
        bus.setBusModel(dto.getBusModel());
        bus.setCapacity(dto.getCapacity());
        if (dto.getStatus() != null) {
            bus.setStatus(Bus.BusStatus.valueOf(dto.getStatus().toUpperCase()));
        }
        if (dto.getDriverId() != null) {
            userRepository.findById(dto.getDriverId()).ifPresent(bus::setDriver);
        }
        if (dto.getRouteId() != null) {
            routeRepository.findById(dto.getRouteId()).ifPresent(bus::setAssignedRoute);
        }
        return bus;
    }
}
