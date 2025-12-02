package com.college.attendance.dto;

import java.time.LocalDate;

public class SessionUpdateRequest {
    private LocalDate date;
    private Integer period;
    private Long courseId;
    private Long teacherId;
    private String section;
    private String type; // REGULAR, EXTRA, SUBSTITUTION
    private String status; // SCHEDULED, COMPLETED, CANCELLED

    public SessionUpdateRequest() {
    }

    public SessionUpdateRequest(LocalDate date, Integer period, Long courseId, Long teacherId, String section, String type, String status) {
        this.date = date;
        this.period = period;
        this.courseId = courseId;
        this.teacherId = teacherId;
        this.section = section;
        this.type = type;
        this.status = status;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getPeriod() {
        return period;
    }

    public void setPeriod(Integer period) {
        this.period = period;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
