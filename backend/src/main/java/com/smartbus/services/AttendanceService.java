package com.smartbus.services;

import com.smartbus.dto.AttendanceDto;
import com.smartbus.exceptions.CustomException;
import com.smartbus.exceptions.ResourceNotFoundException;
import com.smartbus.models.Attendance;
import com.smartbus.models.Bus;
import com.smartbus.models.Student;
import com.smartbus.repositories.AttendanceRepository;
import com.smartbus.repositories.BusRepository;
import com.smartbus.repositories.StudentRepository;
import com.smartbus.utils.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final BusRepository busRepository;
    private final NotificationService notificationService;

    public AttendanceDto markAttendance(AttendanceDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", dto.getStudentId()));

        LocalDate today = LocalDate.now();
        attendanceRepository.findByStudentIdAndAttendanceDate(dto.getStudentId(), today)
                .ifPresent(existing -> {
                    throw new CustomException("Attendance already marked for today", HttpStatus.CONFLICT);
                });

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setAttendanceDate(today);
        attendance.setTimestamp(LocalDateTime.now());
        attendance.setStatus(Attendance.AttendanceStatus.valueOf(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "PRESENT"));
        attendance.setLatitude(dto.getLatitude());
        attendance.setLongitude(dto.getLongitude());
        attendance.setNotes(dto.getNotes());

        if (dto.getBusId() != null) {
            busRepository.findById(dto.getBusId()).ifPresent(attendance::setBus);
        }

        Attendance saved = attendanceRepository.save(attendance);

        // Notify parent
        if ("PRESENT".equals(saved.getStatus().name())) {
            String busNumber = saved.getBus() != null ? saved.getBus().getBusNumber() : "N/A";
            notificationService.sendBoardingNotification(student.getParentEmail(), student.getFullName(), busNumber);
        }

        return toDto(saved);
    }

    public AttendanceDto markAttendanceByQR(String qrContent, Long busId) {
        // QR format: SMARTBUS_STUDENT:rollNumber:studentId
        String[] parts = qrContent.split(":");
        if (parts.length < 3 || !"SMARTBUS_STUDENT".equals(parts[0])) {
            throw new CustomException("Invalid QR code", HttpStatus.BAD_REQUEST);
        }

        Long studentId = Long.parseLong(parts[2]);
        AttendanceDto dto = new AttendanceDto();
        dto.setStudentId(studentId);
        dto.setBusId(busId);
        dto.setStatus("PRESENT");

        return markAttendance(dto);
    }

    public List<AttendanceDto> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getAttendanceByBusAndDate(Long busId, LocalDate date) {
        return attendanceRepository.findByBusIdAndAttendanceDate(busId, date).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getAttendanceHistory(Long studentId, LocalDate start, LocalDate end) {
        return attendanceRepository.findByStudentIdAndAttendanceDateBetween(studentId, start, end).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Map<String, Long> getAttendanceStats(Long studentId, LocalDate start, LocalDate end) {
        Map<String, Long> stats = new java.util.HashMap<>();
        for (Attendance.AttendanceStatus status : Attendance.AttendanceStatus.values()) {
            Long count = attendanceRepository.countByStudentIdAndStatusAndDateRange(studentId, status, start, end);
            stats.put(status.name(), count);
        }
        return stats;
    }

    public AttendanceDto toDto(Attendance attendance) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(attendance.getId());
        dto.setStudentId(attendance.getStudent().getId());
        dto.setStudentName(attendance.getStudent().getFullName());
        dto.setRollNumber(attendance.getStudent().getRollNumber());
        if (attendance.getBus() != null) {
            dto.setBusId(attendance.getBus().getId());
            dto.setBusNumber(attendance.getBus().getBusNumber());
        }
        dto.setStatus(attendance.getStatus().name());
        dto.setAttendanceDate(attendance.getAttendanceDate());
        dto.setTimestamp(attendance.getTimestamp());
        dto.setLatitude(attendance.getLatitude());
        dto.setLongitude(attendance.getLongitude());
        dto.setNotes(attendance.getNotes());
        return dto;
    }
}
