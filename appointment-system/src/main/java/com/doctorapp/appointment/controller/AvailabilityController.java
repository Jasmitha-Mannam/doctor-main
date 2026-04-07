package com.doctorapp.appointment.controller;

import com.doctorapp.appointment.entity.Availability;
import com.doctorapp.appointment.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService service;

    // Doctor adds a slot — body: { doctorId, date, timeSlot, mode }
    @PostMapping
    public ResponseEntity<?> addSlot(@RequestBody Map<String, String> body) {
        try {
            Long doctorId = Long.parseLong(body.get("doctorId"));
            String date      = body.get("date");
            String timeSlot  = body.get("timeSlot");
            String mode      = body.get("mode");
            if (date == null || timeSlot == null || mode == null)
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "date, timeSlot and mode are required."));
            return ResponseEntity.status(201).body(service.addSlot(doctorId, date, timeSlot, mode));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Patient gets available slots: GET /api/availability/{doctorId}?mode=ONLINE
    @GetMapping("/{doctorId}")
    public List<Availability> getAvailable(
            @PathVariable Long doctorId,
            @RequestParam(required = false) String mode) {
        return service.getAvailableSlots(doctorId, mode);
    }

    // Doctor views all their slots
    @GetMapping("/doctor/{doctorId}")
    public List<Availability> getDoctorSlots(@PathVariable Long doctorId) {
        return service.getDoctorSlots(doctorId);
    }

    // Doctor deletes a slot
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        try {
            service.deleteSlot(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Slot deleted."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}