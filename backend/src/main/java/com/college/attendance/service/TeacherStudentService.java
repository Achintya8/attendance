package com.college.attendance.service;

import com.college.attendance.dto.StudentDetailDTO;
import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDate;
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
    private final MasterTimetableRepository masterTimetableRepository;

    public TeacherStudentService(StudentRepository studentRepository, AttendanceRepository attendanceRepository,
            TeacherCourseAllocationRepository teacherCourseAllocationRepository,
            TeacherRepository teacherRepository,
            CourseRepository courseRepository,
            StudentCourseEnrollmentRepository studentCourseEnrollmentRepository,
            MasterTimetableRepository masterTimetableRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.teacherCourseAllocationRepository = teacherCourseAllocationRepository;
        this.teacherRepository = teacherRepository;
        this.courseRepository = courseRepository;
        this.studentCourseEnrollmentRepository = studentCourseEnrollmentRepository;
        this.masterTimetableRepository = masterTimetableRepository;
    }

    public List<StudentDetailDTO> getTeacherStudents(Long teacherId, String courseIdStr, String section) {
        return getTeacherStudents(teacherId, courseIdStr, section, null, null);
    }

    public List<StudentDetailDTO> getTeacherStudents(Long teacherId, String courseIdStr, String section, LocalDate from, LocalDate to) {
        List<Student> students;

        // Fetch teacher to get default department
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        Long departmentId = teacher.getDepartment().getId();

        // Check if a specific course is selected to override department
        if (courseIdStr != null && !courseIdStr.isEmpty()) {
            Long courseId = Long.parseLong(courseIdStr);
            Course course = courseRepository.findById(courseId).orElse(null);

            if (course != null) {
                // Use Course's Department instead of Teacher's Department
                departmentId = course.getDepartment().getId();

                if (course.getType() == CourseType.ELECTIVE) {
                    // For electives, fetch only enrolled students
                    List<Long> enrolledStudentIds = studentCourseEnrollmentRepository
                            .findStudentIdsByCourseId(courseId);
                    students = studentRepository.findAllById(enrolledStudentIds);

                    // Apply section filter if present
                    if (section != null && !section.isEmpty() && !section.equalsIgnoreCase("MERGED")) {
                        List<String> sections = Arrays.asList(section.split(","));
                        students = students.stream()
                                .filter(s -> sections.contains(s.getSection()))
                                .collect(Collectors.toList());
                    }

                    return students.stream()
                            .sorted(Comparator.comparing(Student::getName, String.CASE_INSENSITIVE_ORDER))
                            .map(s -> convertToStudentDetailDTO(s, courseId, from, to))
                            .collect(Collectors.toList());
                }
            }
        }

        // Default behavior: Filter by Department (Course's if present, else Teacher's)
        Long courseFilterId = (courseIdStr != null && !courseIdStr.isEmpty()) ? Long.parseLong(courseIdStr) : null;

        if (section != null && !section.isEmpty() && !section.equalsIgnoreCase("MERGED")) {
            if (section.contains(",")) {
                List<String> sections = Arrays.asList(section.split(","));
                students = studentRepository.findByDepartmentIdAndSectionIn(departmentId, sections);
            } else {
                students = studentRepository.findByDepartmentIdAndSection(departmentId, section);
            }
        } else {
            students = studentRepository.findByDepartmentId(departmentId);
        }

        return students.stream()
                .sorted(Comparator.comparing(Student::getName, String.CASE_INSENSITIVE_ORDER))
                .map(s -> convertToStudentDetailDTO(s, courseFilterId, from, to))
                .collect(Collectors.toList());
    }

    public List<String> getTeacherSections(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Set<String> sections = new HashSet<>();

        // 1. Sections from Home Department
        sections.addAll(studentRepository.findDistinctSectionsByDepartmentId(teacher.getDepartment().getId()));

        // 2. Sections from Teacher Course Allocations
        List<TeacherCourseAllocation> allocations = teacherCourseAllocationRepository.findByTeacherId(teacherId);
        for (TeacherCourseAllocation alloc : allocations) {
            if (alloc.getSection() != null && !alloc.getSection().isEmpty()
                    && !alloc.getSection().equals("MERGED")) {
                sections.add(alloc.getSection());
            }
        }

        // 3. Sections from Master Timetable
        List<MasterTimetable> timetableEntries = masterTimetableRepository.findByTeacherId(teacherId); // Need to ensure
                                                                                                       // this method
                                                                                                       // exists
        for (MasterTimetable mt : timetableEntries) {
            if (mt.getSection() != null && !mt.getSection().isEmpty()
                    && !mt.getSection().equals("MERGED")) {
                sections.add(mt.getSection());
            }
        }

        return sections.stream().sorted().collect(Collectors.toList());
    }

    public StudentDetailDTO getStudentDetail(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return convertToStudentDetailDTO(student, null, null, null);
    }

    /**
     * Generates a CSV byte array covering all students visible to a teacher,
     * optionally filtered by course, section, and date range.
     */
    public byte[] exportStudentsCsv(Long teacherId, String courseIdStr, String section, LocalDate from, LocalDate to) {
        List<StudentDetailDTO> students = getTeacherStudents(teacherId, courseIdStr, section, from, to);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter pw = new PrintWriter(baos);

        // Header
        String dateRange = (from != null && to != null) ? (from + " to " + to) : "All Time";
        pw.println("Attendance Report - " + dateRange);
        pw.println("Roll No,Name,Department,Section,Semester,Batch,Present,Absent,On Duty,Medical,Total,Attendance %");

        for (StudentDetailDTO s : students) {
            Map<String, Long> bd = s.getAttendanceBreakdown();
            long p = bd.getOrDefault("P", 0L);
            long a = bd.getOrDefault("A", 0L);
            long o = bd.getOrDefault("O", 0L);
            long m = bd.getOrDefault("M", 0L);
            long total = p + a + o + m;
            pw.printf("\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",%d,%d,%d,%d,%d,%.1f%n",
                    s.getRollNum(), s.getName(), s.getDepartment(), s.getSection(),
                    s.getSemester(), s.getCurrentBatch(),
                    p, a, o, m, total, s.getAttendancePercentage());
        }

        pw.flush();
        return baos.toByteArray();
    }

    public List<Attendance> getStudentAttendanceHistory(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<StudentDetailDTO> searchStudents(String query) {
        List<Student> students = studentRepository.findByNameContainingIgnoreCaseOrRollNumContainingIgnoreCase(query,
                query);
        return students.stream()
                .map(s -> convertToStudentDetailDTO(s, null, null, null))
                .collect(Collectors.toList());
    }

    private StudentDetailDTO convertToStudentDetailDTO(Student student, Long courseId, LocalDate from, LocalDate to) {
        List<Attendance> attendanceRecords;

        if (from != null && to != null) {
            if (courseId != null) {
                attendanceRecords = attendanceRepository.findByStudentIdAndCourseIdAndDateRange(student.getId(), courseId, from, to);
            } else {
                attendanceRecords = attendanceRepository.findByStudentIdAndDateRange(student.getId(), from, to);
            }
        } else {
            attendanceRecords = attendanceRepository.findByStudentId(student.getId());
            if (courseId != null) {
                attendanceRecords = attendanceRecords.stream()
                        .filter(a -> a.getSession().getCourse().getId().equals(courseId))
                        .collect(Collectors.toList());
            }
        }

        Map<String, Long> breakdown = attendanceRecords.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().toString(), Collectors.counting()));

        long totalClasses = attendanceRecords.size();
        long presentCount = breakdown.getOrDefault("P", 0L) + breakdown.getOrDefault("O", 0L);
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
                Math.round(percentage * 100.0) / 100.0,
                breakdown);
    }
}
