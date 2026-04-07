package com.doctorapp.appointment.controller;

import com.doctorapp.appointment.entity.Appointment;
import com.doctorapp.appointment.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService service;

    @PostMapping("/book")
    public ResponseEntity<?> book(@RequestBody Appointment a) {
        try {
            return ResponseEntity.status(201).body(service.book(a));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/patient/{userId}")
    public List<Appointment> getByPatient(@PathVariable Long userId) {
        return service.getByPatient(userId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getByDoctor(@PathVariable Long doctorId) {
        return service.getByDoctor(doctorId);
    }

    @GetMapping
    public List<Appointment> getAll() {
        return service.getAll();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(service.updateStatus(id, body.get("status")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/summary/doctor/{doctorId}")
    public Map<String, Object> getDailySummary(@PathVariable Long doctorId) {
        return service.getDailySummary(doctorId);
    }

    @GetMapping("/history/{userId}")
    public List<Appointment> getMedicalHistory(@PathVariable Long userId) {
        return service.getMedicalHistory(userId);
    }

    // ✅ FIXED CONFIRM API
    @PutMapping("/{id}/confirm")
    public ResponseEntity<Appointment> confirmAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(service.confirmAppointment(id));
    }
}