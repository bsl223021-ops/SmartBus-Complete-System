package com.smartbus.services;

import com.google.zxing.WriterException;
import com.smartbus.dto.StudentDto;
import com.smartbus.exceptions.CustomException;
import com.smartbus.exceptions.ResourceNotFoundException;
import com.smartbus.models.Bus;
import com.smartbus.models.Student;
import com.smartbus.repositories.BusRepository;
import com.smartbus.repositories.StudentRepository;
import com.smartbus.utils.QRCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final BusRepository busRepository;
    private final QRCodeGenerator qrCodeGenerator;

    public List<StudentDto> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public StudentDto getStudentById(Long id) {
        return toDto(studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id)));
    }

    public StudentDto createStudent(StudentDto dto) {
        if (studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new CustomException("Student with roll number " + dto.getRollNumber() + " already exists",
                    HttpStatus.CONFLICT);
        }
        Student student = toEntity(dto);
        student.setActive(true);
        Student saved = studentRepository.save(student);

        // Generate QR code
        try {
            String qrContent = qrCodeGenerator.generateStudentQRContent(saved.getRollNumber(), saved.getId());
            saved.setQrCode(qrCodeGenerator.generateQRCode(qrContent));
            saved = studentRepository.save(saved);
        } catch (WriterException | IOException e) {
            // QR generation failed, continue without it
        }

        return toDto(saved);
    }

    public StudentDto updateStudent(Long id, StudentDto dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));

        student.setFullName(dto.getFullName());
        student.setParentEmail(dto.getParentEmail());
        student.setParentPhone(dto.getParentPhone());
        student.setGrade(dto.getGrade());
        student.setSection(dto.getSection());
        student.setBoardingPoint(dto.getBoardingPoint());

        if (dto.getBusId() != null) {
            Bus bus = busRepository.findById(dto.getBusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bus", dto.getBusId()));
            student.setAssignedBus(bus);
        } else {
            student.setAssignedBus(null);
        }

        return toDto(studentRepository.save(student));
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student", id);
        }
        studentRepository.deleteById(id);
    }

    public String getStudentQRCode(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));

        if (student.getQrCode() == null) {
            try {
                String qrContent = qrCodeGenerator.generateStudentQRContent(student.getRollNumber(), student.getId());
                String qrCode = qrCodeGenerator.generateQRCode(qrContent);
                student.setQrCode(qrCode);
                studentRepository.save(student);
                return qrCode;
            } catch (WriterException | IOException e) {
                throw new CustomException("Failed to generate QR code", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return student.getQrCode();
    }

    public List<StudentDto> getStudentsByBus(Long busId) {
        return studentRepository.findByAssignedBusId(busId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<StudentDto> searchStudents(String name) {
        return studentRepository.searchByName(name).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public StudentDto toDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.setId(student.getId());
        dto.setRollNumber(student.getRollNumber());
        dto.setFullName(student.getFullName());
        dto.setParentEmail(student.getParentEmail());
        dto.setParentPhone(student.getParentPhone());
        dto.setGrade(student.getGrade());
        dto.setSection(student.getSection());
        dto.setBoardingPoint(student.getBoardingPoint());
        dto.setActive(student.getActive());
        if (student.getAssignedBus() != null) {
            dto.setBusId(student.getAssignedBus().getId());
            dto.setBusNumber(student.getAssignedBus().getBusNumber());
        }
        dto.setQrCode(student.getQrCode());
        return dto;
    }

    private Student toEntity(StudentDto dto) {
        Student student = new Student();
        student.setRollNumber(dto.getRollNumber());
        student.setFullName(dto.getFullName());
        student.setParentEmail(dto.getParentEmail());
        student.setParentPhone(dto.getParentPhone());
        student.setGrade(dto.getGrade());
        student.setSection(dto.getSection());
        student.setBoardingPoint(dto.getBoardingPoint());
        if (dto.getBusId() != null) {
            busRepository.findById(dto.getBusId()).ifPresent(student::setAssignedBus);
        }
        return student;
    }
}
