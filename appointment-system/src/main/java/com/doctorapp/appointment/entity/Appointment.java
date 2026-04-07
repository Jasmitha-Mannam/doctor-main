package com.doctorapp.appointment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private LocalTime time;

    private String mode;    // ONLINE / OFFLINE
    private String status;  // BOOKED / COMPLETED / CANCELLED / NO_SHOW
    private String notes;
    private String meetingLink; // for ONLINE

    private Double fee;

    // ✅ FIX 1: Proper relationship with Availability
    @ManyToOne
    @JoinColumn(name = "slot_id")
    private Availability slot;

    // ✅ Already correct (keep this)
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}