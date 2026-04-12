package com.smartbus.services;

import com.smartbus.dto.RouteDto;
import com.smartbus.exceptions.CustomException;
import com.smartbus.exceptions.ResourceNotFoundException;
import com.smartbus.models.Route;
import com.smartbus.models.RouteStoppage;
import com.smartbus.repositories.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;

    public List<RouteDto> getAllRoutes() {
        return routeRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public RouteDto getRouteById(Long id) {
        return toDto(routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route", id)));
    }

    public RouteDto createRoute(RouteDto dto) {
        if (routeRepository.existsByRouteName(dto.getRouteName())) {
            throw new CustomException("Route with name " + dto.getRouteName() + " already exists",
                    HttpStatus.CONFLICT);
        }
        Route route = toEntity(dto);
        Route saved = routeRepository.save(route);
        return toDto(saved);
    }

    public RouteDto updateRoute(Long id, RouteDto dto) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route", id));

        route.setRouteName(dto.getRouteName());
        route.setStartPoint(dto.getStartPoint());
        route.setEndPoint(dto.getEndPoint());
        if (dto.getActive() != null) {
            route.setActive(dto.getActive());
        }

        if (dto.getStoppages() != null) {
            List<RouteStoppage> stoppages = new ArrayList<>();
            for (RouteDto.StoppageDto sDto : dto.getStoppages()) {
                RouteStoppage stoppage = new RouteStoppage();
                stoppage.setRoute(route);
                stoppage.setStoppageName(sDto.getStoppageName());
                stoppage.setLatitude(sDto.getLatitude());
                stoppage.setLongitude(sDto.getLongitude());
                stoppage.setSequenceOrder(sDto.getSequenceOrder());
                stoppage.setEstimatedArrivalTime(sDto.getEstimatedArrivalTime());
                stoppages.add(stoppage);
            }
            route.getStoppages().clear();
            route.getStoppages().addAll(stoppages);
        }

        return toDto(routeRepository.save(route));
    }

    public void deleteRoute(Long id) {
        if (!routeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Route", id);
        }
        routeRepository.deleteById(id);
    }

    public List<RouteDto.StoppageDto> getRouteStoppages(Long routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route", routeId));
        if (route.getStoppages() == null) return new ArrayList<>();
        return route.getStoppages().stream()
                .map(this::toStoppageDto)
                .collect(Collectors.toList());
    }

    public RouteDto toDto(Route route) {
        RouteDto dto = new RouteDto();
        dto.setId(route.getId());
        dto.setRouteName(route.getRouteName());
        dto.setStartPoint(route.getStartPoint());
        dto.setEndPoint(route.getEndPoint());
        dto.setActive(route.getActive());
        if (route.getStoppages() != null) {
            dto.setStoppages(route.getStoppages().stream()
                    .map(this::toStoppageDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private RouteDto.StoppageDto toStoppageDto(RouteStoppage s) {
        RouteDto.StoppageDto dto = new RouteDto.StoppageDto();
        dto.setId(s.getId());
        dto.setStoppageName(s.getStoppageName());
        dto.setLatitude(s.getLatitude());
        dto.setLongitude(s.getLongitude());
        dto.setSequenceOrder(s.getSequenceOrder());
        dto.setEstimatedArrivalTime(s.getEstimatedArrivalTime());
        return dto;
    }

    private Route toEntity(RouteDto dto) {
        Route route = new Route();
        route.setRouteName(dto.getRouteName());
        route.setStartPoint(dto.getStartPoint());
        route.setEndPoint(dto.getEndPoint());
        route.setActive(dto.getActive() != null ? dto.getActive() : true);
        route.setStoppages(new ArrayList<>());
        return route;
    }
}
