package com.doctorapp.appointment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.doctorapp.appointment.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // 🔥 FIX: Explicit relationship mapping
    List<Appointment> findByUser_Id(Long userId);

    List<Appointment> findByDoctor_Id(Long doctorId);

    List<Appointment> findByStatus(String status);
    List<Appointment> findByUser_IdAndStatus(Long userId, String status);
}