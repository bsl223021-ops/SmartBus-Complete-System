package com.smartbus.repositories;

import com.smartbus.models.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByAttendanceDate(LocalDate date);
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByBusIdAndAttendanceDate(Long busId, LocalDate date);
    List<Attendance> findByStudentIdAndAttendanceDateBetween(Long studentId, LocalDate start, LocalDate end);
    Optional<Attendance> findByStudentIdAndAttendanceDate(Long studentId, LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = :status AND a.attendanceDate BETWEEN :start AND :end")
    Long countByStudentIdAndStatusAndDateRange(@Param("studentId") Long studentId,
                                               @Param("status") Attendance.AttendanceStatus status,
                                               @Param("start") LocalDate start,
                                               @Param("end") LocalDate end);
}
