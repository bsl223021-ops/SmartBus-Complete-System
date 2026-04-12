package com.smartbus.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "route_stoppages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteStoppage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @Column(name = "stoppage_name", nullable = false)
    private String stoppageName;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "sequence_order")
    private Integer sequenceOrder;

    @Column(name = "estimated_arrival_time")
    private String estimatedArrivalTime;
}
