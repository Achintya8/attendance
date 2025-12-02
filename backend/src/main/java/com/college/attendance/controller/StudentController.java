package com.college.attendance.controller;

import com.college.attendance.entity.AttendanceStatus;
import com.college.attendance.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
public class StudentController {

    private final AttendanceService attendanceService;

    public StudentController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/stats/{studentId}")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentStats(studentId));
    }

    @GetMapping("/attendance/courses/{studentId}")
    public ResponseEntity<List<Map<String, Object>>> getCourseWiseAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getCourseWiseAttendance(studentId));
    }
}
