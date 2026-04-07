package com.doctorapp.appointment.controller;

import com.doctorapp.appointment.entity.Doctor;
import com.doctorapp.appointment.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorRepository doctorRepo;

    // GET /api/doctors?specialty=Cardiology&mode=ONLINE
    @GetMapping
    public List<Doctor> getDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String mode) {

        if (specialty != null && mode != null)
            return doctorRepo.findBySpecialtyAndMode(specialty, mode);
        if (specialty != null)
            return doctorRepo.findBySpecialty(specialty);
        return doctorRepo.findAll();
    }

    @GetMapping("/specialties")
    public List<String> getSpecialties() {
        return doctorRepo.findDistinctSpecialties();
    }

    @GetMapping("/{id}")
    public Doctor getById(@PathVariable Long id) {
        return doctorRepo.findById(id).orElseThrow(() -> new RuntimeException("Doctor not found"));
    }
}