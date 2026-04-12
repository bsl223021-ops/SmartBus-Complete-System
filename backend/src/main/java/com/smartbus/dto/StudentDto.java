package com.smartbus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private Long id;

    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Valid parent email is required")
    @NotBlank(message = "Parent email is required")
    private String parentEmail;

    private String parentPhone;
    private String grade;
    private String section;
    private String boardingPoint;
    private Long busId;
    private String busNumber;
    private String qrCode;
    private Boolean active;
}
