package com.college.attendance.dto;

import java.util.Map;

public class StudentDetailDTO {
    private Long id;
    private String rollNum;
    private String name;
    private String email;
    private String department;
    private Integer semester;
    private String section;
    private Integer admissionYear;
    private String currentBatch;
    private Double attendancePercentage;
    private Map<String, Long> attendanceBreakdown; // P, A, O, M counts

    public StudentDetailDTO() {
    }

    public StudentDetailDTO(Long id, String rollNum, String name, String email, String department, 
                           Integer semester, String section, Integer admissionYear, String currentBatch,
                           Double attendancePercentage, Map<String, Long> attendanceBreakdown) {
        this.id = id;
        this.rollNum = rollNum;
        this.name = name;
        this.email = email;
        this.department = department;
        this.semester = semester;
        this.section = section;
        this.admissionYear = admissionYear;
        this.currentBatch = currentBatch;
        this.attendancePercentage = attendancePercentage;
        this.attendanceBreakdown = attendanceBreakdown;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRollNum() {
        return rollNum;
    }

    public void setRollNum(String rollNum) {
        this.rollNum = rollNum;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Integer getAdmissionYear() {
        return admissionYear;
    }

    public void setAdmissionYear(Integer admissionYear) {
        this.admissionYear = admissionYear;
    }

    public String getCurrentBatch() {
        return currentBatch;
    }

    public void setCurrentBatch(String currentBatch) {
        this.currentBatch = currentBatch;
    }

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public Map<String, Long> getAttendanceBreakdown() {
        return attendanceBreakdown;
    }

    public void setAttendanceBreakdown(Map<String, Long> attendanceBreakdown) {
        this.attendanceBreakdown = attendanceBreakdown;
    }
}
