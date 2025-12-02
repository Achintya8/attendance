package com.college.attendance.service;

import com.college.attendance.dto.StudentDetailDTO;
import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeacherStudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final TeacherCourseAllocationRepository teacherCourseAllocationRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final StudentCourseEnrollmentRepository studentCourseEnrollmentRepository;

    public TeacherStudentService(StudentRepository studentRepository, AttendanceRepository attendanceRepository,
            TeacherCourseAllocationRepository teacherCourseAllocationRepository,
            TeacherRepository teacherRepository,
            CourseRepository courseRepository,
            StudentCourseEnrollmentRepository studentCourseEnrollmentRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.teacherCourseAllocationRepository = teacherCourseAllocationRepository;
        this.teacherRepository = teacherRepository;
        this.courseRepository = courseRepository;
        this.studentCourseEnrollmentRepository = studentCourseEnrollmentRepository;
    }

    public List<StudentDetailDTO> getTeacherStudents(Long teacherId, String courseIdStr, String section) {
        List<Student> students;

        // Fetch teacher to get department
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        Long departmentId = teacher.getDepartment().getId();

        // Check if a specific course is selected
        if (courseIdStr != null && !courseIdStr.isEmpty()) {
            Long courseId = Long.parseLong(courseIdStr);
            Course course = courseRepository.findById(courseId).orElse(null);

            if (course != null && course.getType() == CourseType.ELECTIVE) {
                // For electives, fetch only enrolled students
                List<Long> enrolledStudentIds = studentCourseEnrollmentRepository.findStudentIdsByCourseId(courseId);
                students = studentRepository.findAllById(enrolledStudentIds);

                // Apply section filter if present
                if (section != null && !section.isEmpty()) {
                    students = students.stream()
                            .filter(s -> s.getSection().equals(section))
                            .collect(Collectors.toList());
                }

                return students.stream()
                        .map(this::convertToStudentDetailDTO)
                        .collect(Collectors.toList());
            }
        }

        // Default behavior: Filter by Teacher's Department
        if (section != null && !section.isEmpty()) {
            students = studentRepository.findByDepartmentIdAndSection(departmentId, section);
        } else {
            students = studentRepository.findByDepartmentId(departmentId);
        }

        return students.stream()
                .map(this::convertToStudentDetailDTO)
                .collect(Collectors.toList());
    }

    public List<String> getTeacherSections(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return studentRepository.findDistinctSectionsByDepartmentId(teacher.getDepartment().getId());
    }

    public StudentDetailDTO getStudentDetail(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return convertToStudentDetailDTO(student);
    }

    public List<Attendance> getStudentAttendanceHistory(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<StudentDetailDTO> searchStudents(String query) {
        List<Student> students = studentRepository.findByNameContainingIgnoreCaseOrRollNumContainingIgnoreCase(query,
                query);
        return students.stream()
                .map(this::convertToStudentDetailDTO)
                .collect(Collectors.toList());
    }

    private StudentDetailDTO convertToStudentDetailDTO(Student student) {
        List<Attendance> attendanceRecords = attendanceRepository.findByStudentId(student.getId());

        // Calculate attendance stats
        Map<String, Long> breakdown = attendanceRecords.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getStatus().toString(),
                        Collectors.counting()));

        long totalClasses = attendanceRecords.size();
        long presentCount = breakdown.getOrDefault("P", 0L) + breakdown.getOrDefault("O", 0L); // P + On Duty count as
                                                                                               // present
        double percentage = totalClasses > 0 ? (presentCount * 100.0 / totalClasses) : 0.0;

        return new StudentDetailDTO(
                student.getId(),
                student.getRollNum(),
                student.getName(),
                student.getEmail(),
                student.getDepartment().getName(),
                student.getSemester(),
                student.getSection(),
                student.getAdmissionYear(),
                student.getCurrentBatch(),
                Math.round(percentage * 100.0) / 100.0, // Round to 2 decimals
                breakdown);
    }
}
