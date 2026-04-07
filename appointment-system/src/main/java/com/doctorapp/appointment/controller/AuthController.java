package com.doctorapp.appointment.controller;

import com.doctorapp.appointment.entity.*;
import com.doctorapp.appointment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final DoctorRepository doctorRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ── REGISTER PATIENT ──────────────────────────────
    @PostMapping("/register/patient")
    public ResponseEntity<?> registerPatient(@RequestBody User user) {
        if (userRepo.existsByEmail(user.getEmail()))
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already registered."));
        user.setRole("PATIENT");
        user.setPassword(encoder.encode(user.getPassword()));
        User saved = userRepo.save(user);
        return ResponseEntity.status(201).body(toUserMap(saved));
    }

    // ── REGISTER DOCTOR ───────────────────────────────
    @PostMapping("/register/doctor")
    public ResponseEntity<?> registerDoctor(@RequestBody Doctor doctor) {
        if (doctorRepo.existsByEmail(doctor.getEmail()))
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already registered."));
//        doctor.setRole("Doctor");
        doctor.setPassword(encoder.encode(doctor.getPassword()));
        Doctor saved = doctorRepo.save(doctor);
        return ResponseEntity.status(201).body(toDoctorMap(saved));
    }

    // ── LOGIN (ALL ROLES) ─────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        if (email == null || password == null)
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and password required."));

        // Check user table (PATIENT / ADMIN)
        Optional<User> userOpt = userRepo.findByEmail(email.toLowerCase().trim());
        if (userOpt.isPresent()) {
            User u = userOpt.get();
            if (!encoder.matches(password, u.getPassword()))
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Incorrect password."));
            return ResponseEntity.ok(toUserMap(u));
        }

        // Check doctor table
        Optional<Doctor> docOpt = doctorRepo.findByEmail(email.toLowerCase().trim());
        if (docOpt.isPresent()) {
            Doctor d = docOpt.get();
            if (!encoder.matches(password, d.getPassword()))
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Incorrect password."));
            return ResponseEntity.ok(toDoctorMap(d));
        }

        return ResponseEntity.status(404).body(Map.of("success", false, "message", "No account found with this email."));
    }

    // ── Helpers ───────────────────────────────────────
    private Map<String, Object> toUserMap(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("success",         true);
        m.put("id",              u.getId());
        m.put("name",            u.getName());
        m.put("email",           u.getEmail());
        m.put("role",            u.getRole());
        m.put("phone",           u.getPhone());
        m.put("gender",          u.getGender());
        m.put("dob",             u.getDob());
        m.put("bloodGroup",      u.getBloodGroup());
        m.put("address",         u.getAddress());
        m.put("emergencyContact",u.getEmergencyContact());
        m.put("allergies",       u.getAllergies());
        m.put("medicalHistory",  u.getMedicalHistory());
        return m;
    }

    private Map<String, Object> toDoctorMap(Doctor d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("success",       true);
        m.put("id",            d.getId());
        m.put("name",          d.getName());
        m.put("email",         d.getEmail());
        m.put("role",          "DOCTOR");
        m.put("phone",         d.getPhone());
        m.put("gender",        d.getGender());
        m.put("location",      d.getLocation());
        m.put("mode",          d.getMode());
        m.put("specialty",     d.getSpecialty());
        m.put("consultFee",    d.getConsultFee());
        m.put("qualification", d.getQualification());
        m.put("experience",    d.getExperience());
        return m;
    }
}