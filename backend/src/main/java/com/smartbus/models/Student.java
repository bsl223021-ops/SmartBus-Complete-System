package com.smartbus.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "roll_number", nullable = false, unique = true)
    private String rollNumber;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "parent_email", nullable = false)
    private String parentEmail;

    @Column(name = "parent_phone")
    private String parentPhone;

    @Column(name = "grade")
    private String grade;

    @Column(name = "section")
    private String section;

    @Column(name = "qr_code", length = 1000)
    private String qrCode;

    @Column(name = "boarding_point")
    private String boardingPoint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    private Bus assignedBus;

    @Column(name = "active")
    private Boolean active = true;
}
