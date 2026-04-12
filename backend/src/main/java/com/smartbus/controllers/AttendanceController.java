package com.smartbus.controllers;

import com.smartbus.dto.AttendanceDto;
import com.smartbus.services.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    public ResponseEntity<AttendanceDto> markAttendance(@RequestBody AttendanceDto dto) {
        return ResponseEntity.ok(attendanceService.markAttendance(dto));
    }

    @PostMapping("/mark/qr")
    public ResponseEntity<AttendanceDto> markAttendanceByQR(@RequestBody Map<String, Object> request) {
        String qrContent = (String) request.get("qrContent");
        Long busId = request.get("busId") != null ? Long.parseLong(request.get("busId").toString()) : null;
        return ResponseEntity.ok(attendanceService.markAttendanceByQR(qrContent, busId));
    }

    @GetMapping
    public ResponseEntity<List<AttendanceDto>> getAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long busId) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        if (busId != null) {
            return ResponseEntity.ok(attendanceService.getAttendanceByBusAndDate(busId, queryDate));
        }
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(queryDate));
    }

    @GetMapping("/history")
    public ResponseEntity<List<AttendanceDto>> getAttendanceHistory(
            @RequestParam Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getAttendanceHistory(studentId, startDate, endDate));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getAttendanceStats(
            @RequestParam Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getAttendanceStats(studentId, startDate, endDate));
    }
}
