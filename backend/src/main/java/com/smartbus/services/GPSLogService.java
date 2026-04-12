package com.smartbus.services;

import com.smartbus.dto.GPSLogDto;
import com.smartbus.exceptions.ResourceNotFoundException;
import com.smartbus.models.Bus;
import com.smartbus.models.GPSLog;
import com.smartbus.repositories.BusRepository;
import com.smartbus.repositories.GPSLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GPSLogService {

    private final GPSLogRepository gpsLogRepository;
    private final BusRepository busRepository;
    private final BusService busService;

    public GPSLogDto logLocation(GPSLogDto dto) {
        Bus bus = busRepository.findById(dto.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus", dto.getBusId()));

        GPSLog log = new GPSLog();
        log.setBus(bus);
        log.setLatitude(dto.getLatitude());
        log.setLongitude(dto.getLongitude());
        log.setSpeed(dto.getSpeed());
        log.setTimestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now());

        GPSLog saved = gpsLogRepository.save(log);

        // Update bus current location
        busService.updateBusLocation(bus.getId(), dto.getLatitude(), dto.getLongitude());

        return toDto(saved);
    }

    public GPSLogDto getCurrentLocation(Long busId) {
        return gpsLogRepository.findTopByBusIdOrderByTimestampDesc(busId)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("No GPS log found for bus " + busId));
    }

    public List<GPSLogDto> getLocationHistory(Long busId) {
        return gpsLogRepository.findByBusIdOrderByTimestampDesc(busId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<GPSLogDto> getLocationHistoryBetween(Long busId, LocalDateTime start, LocalDateTime end) {
        return gpsLogRepository.findByBusIdAndTimestampBetweenOrderByTimestampAsc(busId, start, end).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public GPSLogDto toDto(GPSLog log) {
        GPSLogDto dto = new GPSLogDto();
        dto.setId(log.getId());
        dto.setBusId(log.getBus().getId());
        dto.setBusNumber(log.getBus().getBusNumber());
        dto.setLatitude(log.getLatitude());
        dto.setLongitude(log.getLongitude());
        dto.setSpeed(log.getSpeed());
        dto.setTimestamp(log.getTimestamp());
        return dto;
    }
}
