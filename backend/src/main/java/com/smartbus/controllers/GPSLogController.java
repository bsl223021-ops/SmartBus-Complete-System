package com.smartbus.controllers;

import com.smartbus.dto.GPSLogDto;
import com.smartbus.services.GPSLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/gps")
@RequiredArgsConstructor
public class GPSLogController {

    private final GPSLogService gpsLogService;

    @PostMapping("/log")
    public ResponseEntity<GPSLogDto> logLocation(@RequestBody GPSLogDto dto) {
        return ResponseEntity.ok(gpsLogService.logLocation(dto));
    }

    @GetMapping("/current/{busId}")
    public ResponseEntity<GPSLogDto> getCurrentLocation(@PathVariable Long busId) {
        return ResponseEntity.ok(gpsLogService.getCurrentLocation(busId));
    }

    @GetMapping("/history/{busId}")
    public ResponseEntity<List<GPSLogDto>> getLocationHistory(
            @PathVariable Long busId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        if (start != null && end != null) {
            return ResponseEntity.ok(gpsLogService.getLocationHistoryBetween(busId, start, end));
        }
        return ResponseEntity.ok(gpsLogService.getLocationHistory(busId));
    }
}
