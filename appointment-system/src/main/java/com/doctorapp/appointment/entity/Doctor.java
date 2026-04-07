package com.doctorapp.appointment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctors")
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    private String phone;
    private String gender;
    private String location;

    private String mode;         // ONLINE / OFFLINE / BOTH
    private String specialty;
    private String qualification;
    private String experience;

    private Double consultFee;

    // Getters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getPhone() {
        return phone;
    }

    public String getGender() {
        return gender;
    }

    public String getLocation() {
        return location;
    }

    public String getMode() {
        return mode;
    }

    public String getSpecialty() {
        return specialty;
    }

    public String getQualification() {
        return qualification;
    }

    public String getExperience() {
        return experience;
    }

    public Double getConsultFee() {
        return consultFee;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public void setConsultFee(Double consultFee) {
        this.consultFee = consultFee;
    }
}