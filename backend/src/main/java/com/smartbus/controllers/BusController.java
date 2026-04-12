package com.smartbus.controllers;

import com.smartbus.dto.BusDto;
import com.smartbus.services.BusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buses")
@RequiredArgsConstructor
public class BusController {

    private final BusService busService;

    @GetMapping
    public ResponseEntity<List<BusDto>> getAllBuses(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(busService.getBusesByStatus(status));
        }
        return ResponseEntity.ok(busService.getAllBuses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusDto> getBusById(@PathVariable Long id) {
        return ResponseEntity.ok(busService.getBusById(id));
    }

    @PostMapping
    public ResponseEntity<BusDto> createBus(@Valid @RequestBody BusDto dto) {
        return ResponseEntity.ok(busService.createBus(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusDto> updateBus(@PathVariable Long id, @Valid @RequestBody BusDto dto) {
        return ResponseEntity.ok(busService.updateBus(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBus(@PathVariable Long id) {
        busService.deleteBus(id);
        return ResponseEntity.ok(Map.of("message", "Bus deleted successfully"));
    }

    @GetMapping("/{id}/location")
    public ResponseEntity<BusDto> getBusLocation(@PathVariable Long id) {
        return ResponseEntity.ok(busService.getBusById(id));
    }

    @PutMapping("/{id}/location")
    public ResponseEntity<BusDto> updateBusLocation(@PathVariable Long id,
            @RequestBody Map<String, Double> location) {
        return ResponseEntity.ok(busService.updateBusLocation(id, location.get("latitude"), location.get("longitude")));
    }
}
