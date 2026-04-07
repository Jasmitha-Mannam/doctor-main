package com.doctorapp.appointment.service;

import com.doctorapp.appointment.entity.Appointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // ── SIMPLE EMAIL HELPER ─────────────────────────
    private void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);
        mailSender.send(msg);
    }

    // ── BOOKING EMAIL ───────────────────────────────
    public void sendBookingConfirmationToPatient(Appointment appt) {
        sendSimpleEmail(
                appt.getUser().getEmail(),
                "Appointment Booked",
                "Your appointment is booked and waiting for doctor confirmation."
        );
    }

    // ── DOCTOR NOTIFICATION ─────────────────────────
    public void sendNewBookingNotificationToDoctor(Appointment appt) {
        sendSimpleEmail(
                appt.getDoctor().getEmail(),
                "New Appointment Request",
                "You have a new appointment request to confirm."
        );
    }

    // ── CONFIRM EMAIL (MAIN FEATURE) ────────────────
    public void sendAppointmentConfirmedEmail(Appointment appt) {

        String subject = "Appointment Confirmed";

        String body = "Appointment Confirmed!\n\n" +
                "Doctor: " + appt.getDoctor().getName() + "\n" +
                "Patient: " + appt.getUser().getName() + "\n" +
                "Date: " + appt.getDate() + "\n" +
                "Time: " + appt.getTime() + "\n" +
                "Mode: " + appt.getMode() + "\n\n";

        if (appt.getMode().equalsIgnoreCase("ONLINE")) {
            body += "Meeting Link: " + appt.getMeetingLink() + "\n";
        } else {
            String location = appt.getDoctor().getLocation();

            String mapsLink = "https://www.google.com/maps/search/?api=1&query="
                    + location.replace(" ", "+");

            body += "Clinic Location: " + location + "\n";
            body += "View Map: " + mapsLink + "\n";
        }

        sendSimpleEmail(appt.getUser().getEmail(), subject, body);
        sendSimpleEmail(appt.getDoctor().getEmail(), subject, body);
    }

    // ── CANCEL EMAIL ────────────────────────────────
    public void sendCancellationEmail(Appointment appt) {

        String msg = "Appointment Cancelled\n\n" +
                "Doctor: " + appt.getDoctor().getName() + "\n" +
                "Patient: " + appt.getUser().getName();

        sendSimpleEmail(appt.getUser().getEmail(), "Appointment Cancelled", msg);
        sendSimpleEmail(appt.getDoctor().getEmail(), "Appointment Cancelled", msg);
    }
}