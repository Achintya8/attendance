package com.college.attendance.controller;

import com.college.attendance.dto.AttendanceDTO;
import com.college.attendance.dto.StudentDetailDTO;
import com.college.attendance.entity.Attendance;
import com.college.attendance.entity.ClassSession;
import com.college.attendance.service.AttendanceService;
import com.college.attendance.service.TeacherStudentService;
import com.college.attendance.service.TimetableService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TimetableService timetableService;
    private final AttendanceService attendanceService;
    private final TeacherStudentService teacherStudentService;
    private final com.college.attendance.service.CourseService courseService;
    private final com.college.attendance.repository.TeacherRepository teacherRepository;

    public TeacherController(TimetableService timetableService, AttendanceService attendanceService,
            TeacherStudentService teacherStudentService,
            com.college.attendance.service.CourseService courseService,
            com.college.attendance.repository.TeacherRepository teacherRepository) {
        this.timetableService = timetableService;
        this.attendanceService = attendanceService;
        this.teacherStudentService = teacherStudentService;
        this.courseService = courseService;
        this.teacherRepository = teacherRepository;
    }

    @GetMapping("/courses")
    public ResponseEntity<List<com.college.attendance.entity.Course>> getAllCourses(
            @RequestParam(value = "teacherId", required = false) Long teacherId) {
        if (teacherId != null) {
            com.college.attendance.entity.Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            return ResponseEntity.ok(courseService.getCoursesByDepartment(teacher.getDepartment().getId()));
        }
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/sections")
    public ResponseEntity<List<String>> getSections(@RequestParam("teacherId") Long teacherId) {
        return ResponseEntity.ok(teacherStudentService.getTeacherSections(teacherId));
    }

    @GetMapping("/schedule")
    public ResponseEntity<List<ClassSession>> getSchedule(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("teacherId") Long teacherId) {
        return ResponseEntity.ok(timetableService.getDailySchedule(date, teacherId));
    }

    @PostMapping("/attendance/{sessionId}")
    public ResponseEntity<String> markAttendance(
            @PathVariable Long sessionId,
            @RequestBody List<AttendanceDTO> attendanceList) {
        try {
            attendanceService.markAttendance(sessionId, attendanceList);
            return ResponseEntity.ok("Attendance marked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/session")
    public ResponseEntity<ClassSession> addExtraClass(
            @RequestBody com.college.attendance.dto.ExtraClassRequest request) {
        System.out.println("Received Add Class Request: " + request);
        System.out.println("Date: " + request.getDate());
        System.out.println("Period: " + request.getPeriod());
        System.out.println("CourseId: " + request.getCourseId());
        System.out.println("TeacherId: " + request.getTeacherId());
        System.out.println("Section: " + request.getSection());

        return ResponseEntity.ok(timetableService.addExtraClass(
                request.getDate(),
                request.getPeriod(),
                request.getCourseId(),
                request.getTeacherId(),
                request.getSection()));
    }

    // ========== Student Management Endpoints ==========

    @GetMapping("/students")
    public ResponseEntity<List<StudentDetailDTO>> getMyStudents(
            @RequestParam("teacherId") Long teacherId,
            @RequestParam(value = "courseId", required = false) String courseId,
            @RequestParam(value = "section", required = false) String section) {
        return ResponseEntity.ok(teacherStudentService.getTeacherStudents(teacherId, courseId, section));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentDetailDTO> getStudentDetail(@PathVariable Long id) {
        return ResponseEntity.ok(teacherStudentService.getStudentDetail(id));
    }

    @GetMapping("/students/{id}/attendance")
    public ResponseEntity<List<Attendance>> getStudentAttendanceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(teacherStudentService.getStudentAttendanceHistory(id));
    }

    @GetMapping("/students/search")
    public ResponseEntity<List<StudentDetailDTO>> searchStudents(@RequestParam("query") String query) {
        return ResponseEntity.ok(teacherStudentService.searchStudents(query));
    }

    // ========== Class Session Management Endpoints ==========

    @PutMapping("/session/{id}")
    public ResponseEntity<ClassSession> updateSession(
            @PathVariable Long id,
            @RequestBody com.college.attendance.dto.SessionUpdateRequest request) {
        try {
            return ResponseEntity.ok(timetableService.updateSession(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/session/{id}")
    public ResponseEntity<String> cancelSession(@PathVariable Long id) {
        try {
            timetableService.cancelSession(id);
            return ResponseEntity.ok("Session cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/session/{id}/substitute")
    public ResponseEntity<ClassSession> substituteTeacher(
            @PathVariable Long id,
            @RequestParam("newTeacherId") Long newTeacherId) {
        try {
            return ResponseEntity.ok(timetableService.substituteTeacher(id, newTeacherId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
