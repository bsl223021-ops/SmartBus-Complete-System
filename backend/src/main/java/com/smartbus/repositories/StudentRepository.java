package com.smartbus.repositories;

import com.smartbus.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNumber(String rollNumber);
    List<Student> findByGradeAndSection(String grade, String section);
    List<Student> findByAssignedBusId(Long busId);
    List<Student> findByParentEmail(String parentEmail);
    boolean existsByRollNumber(String rollNumber);

    @Query("SELECT s FROM Student s WHERE s.fullName LIKE %:name%")
    List<Student> searchByName(@Param("name") String name);

    @Query("SELECT s FROM Student s WHERE s.active = true AND s.assignedBus IS NULL")
    List<Student> findUnassignedActiveStudents();
}
