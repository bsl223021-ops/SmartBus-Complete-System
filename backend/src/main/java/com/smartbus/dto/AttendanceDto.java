package com.smartbus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private Long busId;
    private String busNumber;
    private String status;
    private LocalDate attendanceDate;
    private LocalDateTime timestamp;
    private Double latitude;
    private Double longitude;
    private String notes;
}
