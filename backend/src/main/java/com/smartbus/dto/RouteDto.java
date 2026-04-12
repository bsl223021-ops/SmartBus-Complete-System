package com.smartbus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteDto {
    private Long id;

    @NotBlank(message = "Route name is required")
    private String routeName;

    private String startPoint;
    private String endPoint;
    private Boolean active;
    private List<StoppageDto> stoppages;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoppageDto {
        private Long id;
        private String stoppageName;
        private Double latitude;
        private Double longitude;
        private Integer sequenceOrder;
        private String estimatedArrivalTime;
    }
}
