package com.college.attendance.service;

import com.college.attendance.dto.AttendanceDTO;
import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ClassSessionRepository classSessionRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, ClassSessionRepository classSessionRepository,
            StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.classSessionRepository = classSessionRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public void markAttendance(Long sessionId, List<AttendanceDTO> attendanceList) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<Attendance> attendances = attendanceList.stream().map(dto -> {
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            Attendance attendance = new Attendance();
            attendance.setSession(session);
            attendance.setStudent(student);
            attendance.setStatus(dto.getStatus());
            attendance.setRemarks(dto.getRemarks());
            return attendance;
        }).collect(Collectors.toList());

        attendanceRepository.saveAll(attendances);

        session.setStatus(SessionStatus.COMPLETED);
        classSessionRepository.save(session);
    }

    public Map<AttendanceStatus, Long> getSessionStats(Long sessionId) {
        List<Attendance> attendances = attendanceRepository.findBySessionId(sessionId);
        return attendances.stream()
                .collect(Collectors.groupingBy(Attendance::getStatus, Collectors.counting()));
    }

    /** Student overall stats — optionally filtered by date range */
    public Map<String, Object> getStudentStats(Long studentId, LocalDate from, LocalDate to) {
        List<Attendance> attendances = resolveStudentAttendance(studentId, null, from, to);
        return buildStatsMap(attendances);
    }

    /** Student course-wise attendance — optionally filtered by date range */
    public List<Map<String, Object>> getCourseWiseAttendance(Long studentId, LocalDate from, LocalDate to) {
        List<Attendance> attendances = resolveStudentAttendance(studentId, null, from, to);

        Map<Course, List<Attendance>> byCourse = attendances.stream()
                .collect(Collectors.groupingBy(a -> a.getSession().getCourse()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Course, List<Attendance>> entry : byCourse.entrySet()) {
            Course course = entry.getKey();
            List<Attendance> ca = entry.getValue();

            long total = ca.size();
            long present = ca.stream().filter(a -> a.getStatus() == AttendanceStatus.P
                    || a.getStatus() == AttendanceStatus.O || a.getStatus() == AttendanceStatus.M).count();
            double pct = total > 0 ? (present * 100.0 / total) : 0.0;
            Map<AttendanceStatus, Long> bd = ca.stream()
                    .collect(Collectors.groupingBy(Attendance::getStatus, Collectors.counting()));

            Map<String, Object> row = new HashMap<>();
            row.put("courseId", course.getId());
            row.put("courseName", course.getName());
            row.put("courseCode", course.getCode());
            row.put("totalClasses", total);
            row.put("presentCount", present);
            row.put("percentage", Math.round(pct * 10.0) / 10.0);
            row.put("breakdown", bd);
            result.add(row);
        }

        result.sort((a, b) -> ((String) a.get("courseName")).compareTo((String) b.get("courseName")));
        return result;
    }

    // ---- helpers ----

    private List<Attendance> resolveStudentAttendance(Long studentId, Long courseId, LocalDate from, LocalDate to) {
        if (from != null && to != null) {
            if (courseId != null) {
                return attendanceRepository.findByStudentIdAndCourseIdAndDateRange(studentId, courseId, from, to);
            }
            return attendanceRepository.findByStudentIdAndDateRange(studentId, from, to);
        }
        return attendanceRepository.findByStudentId(studentId);
    }

    private Map<String, Object> buildStatsMap(List<Attendance> attendances) {
        long total = attendances.size();
        long present = attendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.P
                        || a.getStatus() == AttendanceStatus.O || a.getStatus() == AttendanceStatus.M)
                .count();
        double pct = total > 0 ? (present * 100.0 / total) : 0.0;
        Map<AttendanceStatus, Long> bd = attendances.stream()
                .collect(Collectors.groupingBy(Attendance::getStatus, Collectors.counting()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalClasses", total);
        stats.put("presentCount", present);
        stats.put("percentage", Math.round(pct * 10.0) / 10.0);
        stats.put("breakdown", bd);
        return stats;
    }

    // Legacy overloads for backward compat
    public Map<String, Object> getStudentStats(Long studentId) {
        return getStudentStats(studentId, null, null);
    }

    public List<Map<String, Object>> getCourseWiseAttendance(Long studentId) {
        return getCourseWiseAttendance(studentId, null, null);
    }

    public Map<String, Object> getStudentAttendanceStats(Long studentId) {
        return getStudentStats(studentId, null, null);
    }
}
