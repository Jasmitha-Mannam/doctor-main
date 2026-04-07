package com.doctorapp.appointment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.doctorapp.appointment.entity.Availability;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByDoctorIdAndAvailableTrue(Long doctorId);
    List<Availability> findByDoctorId(Long doctorId);
    List<Availability> findByDoctorIdAndAvailableTrueAndModeIgnoreCase(Long doctorId, String mode);
}