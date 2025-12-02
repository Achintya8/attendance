package com.college.attendance.service;

import com.college.attendance.dto.AttendanceDTO;
import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public Map<String, Object> getStudentStats(Long studentId) {
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);

        long totalClasses = attendances.size();
        long presentCount = attendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.P ||
                        a.getStatus() == AttendanceStatus.O ||
                        a.getStatus() == AttendanceStatus.M)
                .count();

        double percentage = totalClasses > 0 ? (presentCount * 100.0 / totalClasses) : 0.0;

        Map<AttendanceStatus, Long> breakdown = attendances.stream()
                .collect(Collectors.groupingBy(Attendance::getStatus, Collectors.counting()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalClasses", totalClasses);
        stats.put("presentCount", presentCount);
        stats.put("percentage", Math.round(percentage * 10.0) / 10.0);
        stats.put("breakdown", breakdown);

        return stats;
    }

    public List<Map<String, Object>> getCourseWiseAttendance(Long studentId) {
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);

        // Group attendances by course
        Map<Course, List<Attendance>> attendancesByCourse = attendances.stream()
                .collect(Collectors.groupingBy(attendance -> attendance.getSession().getCourse()));

        // Build result list
        List<Map<String, Object>> result = new ArrayList<>();

        for (Map.Entry<Course, List<Attendance>> entry : attendancesByCourse.entrySet()) {
            Course course = entry.getKey();
            List<Attendance> courseAttendances = entry.getValue();

            // Calculate stats
            long totalClasses = courseAttendances.size();
            long presentCount = courseAttendances.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.P ||
                            a.getStatus() == AttendanceStatus.O ||
                            a.getStatus() == AttendanceStatus.M)
                    .count();

            double percentage = totalClasses > 0 ? (presentCount * 100.0 / totalClasses) : 0.0;

            // Count by status
            Map<AttendanceStatus, Long> breakdown = courseAttendances.stream()
                    .collect(Collectors.groupingBy(Attendance::getStatus, Collectors.counting()));

            // Build course data
            Map<String, Object> courseData = new HashMap<>();
            courseData.put("courseId", course.getId());
            courseData.put("courseName", course.getName());
            courseData.put("courseCode", course.getCode());
            courseData.put("totalClasses", totalClasses);
            courseData.put("presentCount", presentCount);
            courseData.put("percentage", Math.round(percentage * 10.0) / 10.0);
            courseData.put("breakdown", breakdown);

            result.add(courseData);
        }

        // Sort by course name
        result.sort((a, b) -> ((String) a.get("courseName")).compareTo((String) b.get("courseName")));

        return result;
    }

    public Map<String, Object> getStudentAttendanceStats(Long studentId) {
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);

        long totalClasses = attendances.size();
        long presentCount = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.P).count();
        long absentCount = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.A).count();
        long onDutyCount = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.O).count();
        long medicalCount = attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.M).count();

        long effectivePresent = presentCount + onDutyCount + medicalCount;
        double percentage = totalClasses > 0 ? (effectivePresent * 100.0 / totalClasses) : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalClasses", totalClasses);
        stats.put("present", presentCount);
        stats.put("absent", absentCount);
        stats.put("onDuty", onDutyCount);
        stats.put("medical", medicalCount);
        stats.put("attendancePercentage", percentage);

        return stats;
    }
}
