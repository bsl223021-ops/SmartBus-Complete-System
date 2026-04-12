package com.smartbus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusDto {
    private Long id;

    @NotBlank(message = "Bus number is required")
    private String busNumber;

    private String busModel;
    private Integer capacity;
    private Long driverId;
    private String driverName;
    private String status;
    private Double currentLatitude;
    private Double currentLongitude;
    private Long lastLocationUpdate;
    private Long routeId;
    private String routeName;
}
