package com.doctorapp.appointment.service;

import com.doctorapp.appointment.entity.*;
import com.doctorapp.appointment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository repo;
    private final DoctorRepository doctorRepo;
    private final UserRepository userRepo;
    private final AvailabilityRepository availRepo;
    private final EmailService emailService;

    // ── BOOK APPOINTMENT ─────────────────────────────
    public Appointment book(Appointment a) {

        if (a.getDoctor() == null || a.getDoctor().getId() == null) {
            throw new RuntimeException("Doctor ID is required");
        }

        if (a.getUser() == null || a.getUser().getId() == null) {
            throw new RuntimeException("User ID is required");
        }

        if (a.getSlot() == null || a.getSlot().getId() == null) {
            throw new RuntimeException("Slot ID is required");
        }

        Doctor doctor = doctorRepo.findById(a.getDoctor().getId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        User user = userRepo.findById(a.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Availability slot = availRepo.findById(a.getSlot().getId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (!slot.isAvailable()) {
            throw new RuntimeException("This slot is already booked");
        }

        boolean modeOk = doctor.getMode().equalsIgnoreCase("BOTH")
                || doctor.getMode().equalsIgnoreCase(a.getMode());

        if (!modeOk) {
            throw new RuntimeException("Doctor does not support this mode");
        }

        // Mark slot as booked
        slot.setAvailable(false);
        availRepo.save(slot);

        // Set relationships
        a.setDoctor(doctor);
        a.setUser(user);
        a.setSlot(slot);

        // Set date
        a.setDate(LocalDate.parse(slot.getDate()));

        // 🔥 SAFE TIME PARSING (AM/PM + 24hr)

            a.setTime(LocalTime.parse(slot.getTimeSlot()));


        a.setStatus("BOOKED");
        a.setFee(doctor.getConsultFee());

        Appointment saved = repo.save(a);

        // Send emails
        emailService.sendAppointmentConfirmedEmail(saved);

        return saved;
    }

    // ── UPDATE STATUS ────────────────────────────────
    public Appointment updateStatus(Long id, String status) {

        Appointment a = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        a.setStatus(status);

        // If cancelled → free slot
        if ("CANCELLED".equalsIgnoreCase(status) && a.getSlot() != null) {
            Availability slot = a.getSlot();
            slot.setAvailable(true);
            availRepo.save(slot);

            emailService.sendCancellationEmail(a);
        }

        return repo.save(a);
    }
    // ADD THIS INSIDE YOUR CLASS (before last })
    public Appointment confirmAppointment(Long id) {

        Appointment a = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        a.setStatus("CONFIRMED");

        // 🔥 STEP 1: Generate link FIRST
        if (a.getMode() != null && a.getMode().equalsIgnoreCase("ONLINE")) {
            String link = "https://meet.jit.si/" + java.util.UUID.randomUUID();
            a.setMeetingLink(link);
        }

        // 🔥 STEP 2: SAVE FIRST
        Appointment saved = repo.save(a);

        // 🔥 STEP 3: SEND EMAIL AFTER SAVE
        emailService.sendAppointmentConfirmedEmail(saved);

        return saved;
    }
    // ── GET BY PATIENT ───────────────────────────────
    public List<Appointment> getByPatient(Long userId) {
        return repo.findByUser_Id(userId);
    }

    // ── GET BY DOCTOR ────────────────────────────────
    public List<Appointment> getByDoctor(Long doctorId) {
        return repo.findByDoctor_Id(doctorId);
    }

    // ── GET ALL ──────────────────────────────────────
    public List<Appointment> getAll() {
        return repo.findAll();
    }

    // ── DAILY SUMMARY ────────────────────────────────
    public Map<String, Object> getDailySummary(Long doctorId) {

        List<Appointment> all = repo.findByDoctor_Id(doctorId);

        long booked = all.stream().filter(a -> "BOOKED".equals(a.getStatus())).count();
        long completed = all.stream().filter(a -> "COMPLETED".equals(a.getStatus())).count();
        long cancelled = all.stream().filter(a -> "CANCELLED".equals(a.getStatus())).count();
        long noShow = all.stream().filter(a -> "NO_SHOW".equals(a.getStatus())).count();

        double revenue = all.stream()
                .filter(a -> "COMPLETED".equals(a.getStatus()))
                .mapToDouble(a -> a.getFee() != null ? a.getFee() : 0)
                .sum();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("total", all.size());
        summary.put("booked", booked);
        summary.put("completed", completed);
        summary.put("cancelled", cancelled);
        summary.put("noShow", noShow);
        summary.put("revenue", revenue);
        summary.put("appointments", all);

        return summary;
    }

    // ── MEDICAL HISTORY ──────────────────────────────
    public List<Appointment> getMedicalHistory(Long userId) {
        return repo.findByUser_IdAndStatus(userId, "COMPLETED");
    }
}

