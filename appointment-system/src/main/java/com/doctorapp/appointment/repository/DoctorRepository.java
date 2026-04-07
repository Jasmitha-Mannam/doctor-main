package com.doctorapp.appointment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.doctorapp.appointment.entity.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);
    boolean existsByEmail(String email);

    // Filter doctors: specialty match + mode matches (BOTH counts for both ONLINE and OFFLINE)
    @Query("SELECT d FROM Doctor d WHERE d.specialty = :specialty AND (d.mode = :mode OR d.mode = 'BOTH')")
    List<Doctor> findBySpecialtyAndMode(@Param("specialty") String specialty, @Param("mode") String mode);

    // Get all doctors by specialty (no mode filter)
    List<Doctor> findBySpecialty(String specialty);

    // Get distinct specialties
    @Query("SELECT DISTINCT d.specialty FROM Doctor d WHERE d.specialty IS NOT NULL")
    List<String> findDistinctSpecialties();
}