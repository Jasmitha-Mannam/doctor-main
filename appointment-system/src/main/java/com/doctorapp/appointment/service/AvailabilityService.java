package com.doctorapp.appointment.service;

import com.doctorapp.appointment.entity.Availability;
import com.doctorapp.appointment.entity.Doctor;
import com.doctorapp.appointment.repository.AvailabilityRepository;
import com.doctorapp.appointment.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository repo;
    private final DoctorRepository doctorRepo;

    public Availability addSlot(Long doctorId, String date, String timeSlot, String mode) {
        Doctor doctor = doctorRepo.findById(doctorId)
            .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Check for duplicate
        List<Availability> existing = repo.findByDoctorId(doctorId);
        boolean duplicate = existing.stream().anyMatch(s ->
            s.getDate().equals(date) &&
            s.getTimeSlot().equals(timeSlot) &&
            s.getMode().equalsIgnoreCase(mode)
        );
        if (duplicate) throw new RuntimeException("Slot already exists for this date, time, and mode.");

        Availability slot = new Availability();
        slot.setDoctor(doctor);
        slot.setDate(date);
        slot.setTimeSlot(timeSlot);
        slot.setMode(mode);
        slot.setAvailable(true);
        return repo.save(slot);
    }

    public List<Availability> getAvailableSlots(Long doctorId, String mode) {
        if (mode != null && !mode.isBlank())
            return repo.findByDoctorIdAndAvailableTrueAndModeIgnoreCase(doctorId, mode);
        return repo.findByDoctorIdAndAvailableTrue(doctorId);
    }

    public List<Availability> getDoctorSlots(Long doctorId) {
        return repo.findByDoctorId(doctorId);
    }

    public void deleteSlot(Long id) {
        Availability slot = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Slot not found"));
        if (!slot.isAvailable())
            throw new RuntimeException("Cannot delete a booked slot.");
        repo.deleteById(id);
    }
}