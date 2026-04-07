package com.doctorapp.appointment.dto;

import lombok.Data;

@Data
public class AppointmentRequest {
    private Long doctorId;
    private Long userId;
    private Long slotId;
    private String mode;
    private String notes;
}