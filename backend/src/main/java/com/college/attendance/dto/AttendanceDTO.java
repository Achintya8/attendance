package com.college.attendance.dto;

import com.college.attendance.entity.AttendanceStatus;

public class AttendanceDTO {
    private Long studentId;
    private AttendanceStatus status;
    private String remarks;

    public AttendanceDTO() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
