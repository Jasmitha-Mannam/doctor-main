package com.doctorapp.appointment.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "availability")
@NoArgsConstructor
@AllArgsConstructor
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String date;
    private String timeSlot;
    private String mode;        // ONLINE / OFFLINE

    private boolean available = true;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    // Getters
    public Long getId() {
        return id;
    }

    public String getDate() {
        return date;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public String getMode() {
        return mode;
    }

    public boolean isAvailable() {
        return available;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }
}