package com.smartbus.controllers;

import com.smartbus.dto.RouteDto;
import com.smartbus.services.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @GetMapping
    public ResponseEntity<List<RouteDto>> getAllRoutes() {
        return ResponseEntity.ok(routeService.getAllRoutes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteDto> getRouteById(@PathVariable Long id) {
        return ResponseEntity.ok(routeService.getRouteById(id));
    }

    @PostMapping
    public ResponseEntity<RouteDto> createRoute(@Valid @RequestBody RouteDto dto) {
        return ResponseEntity.ok(routeService.createRoute(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RouteDto> updateRoute(@PathVariable Long id, @Valid @RequestBody RouteDto dto) {
        return ResponseEntity.ok(routeService.updateRoute(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteRoute(@PathVariable Long id) {
        routeService.deleteRoute(id);
        return ResponseEntity.ok(Map.of("message", "Route deleted successfully"));
    }

    @GetMapping("/{id}/stoppages")
    public ResponseEntity<List<RouteDto.StoppageDto>> getRouteStoppages(@PathVariable Long id) {
        return ResponseEntity.ok(routeService.getRouteStoppages(id));
    }
}
