package com.college.attendance.service;

import com.college.attendance.dto.StudentDetailDTO;
import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherStudentServiceTest {

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private TeacherCourseAllocationRepository teacherCourseAllocationRepository;
    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private StudentCourseEnrollmentRepository studentCourseEnrollmentRepository;
    @Mock
    private MasterTimetableRepository masterTimetableRepository;

    private TeacherStudentService teacherStudentService;

    @BeforeEach
    void setUp() {
        teacherStudentService = new TeacherStudentService(
                studentRepository, attendanceRepository, teacherCourseAllocationRepository,
                teacherRepository, courseRepository, studentCourseEnrollmentRepository, masterTimetableRepository);
    }

    @Test
    void getTeacherStudents_ShouldFilterAttendanceByCourse() {
        // Arrange
        Long teacherId = 1L;
        Long courseId1 = 10L;
        Long courseId2 = 20L;
        Long studentId = 100L;

        Department dept = new Department(1L, "CSE", "CSE");
        Teacher teacher = new Teacher();
        teacher.setId(teacherId);
        teacher.setDepartment(dept);

        Student student = new Student();
        student.setId(studentId);
        student.setName("Student 1");
        student.setDepartment(dept);


        Course course1 = new Course();
        course1.setId(courseId1);
        Course course2 = new Course();
        course2.setId(courseId2);

        ClassSession session1 = new ClassSession();
        session1.setCourse(course1);
        ClassSession session2 = new ClassSession();
        session2.setCourse(course2);

        Attendance att1 = new Attendance();
        att1.setSession(session1);
        att1.setStatus(AttendanceStatus.P);
        Attendance att2 = new Attendance();
        att2.setSession(session2);
        att2.setStatus(AttendanceStatus.A);

        when(teacherRepository.findById(teacherId)).thenReturn(Optional.of(teacher));
        when(studentRepository.findByDepartmentId(dept.getId())).thenReturn(List.of(student));
        when(attendanceRepository.findByStudentId(studentId)).thenReturn(Arrays.asList(att1, att2));

        // Act 1: Filter by Course 1
        List<StudentDetailDTO> result1 = teacherStudentService.getTeacherStudents(teacherId, courseId1.toString(),
                null);

        // Assert 1
        assertEquals(1, result1.size());
        assertEquals(100.0, result1.get(0).getAttendancePercentage(), "Should be 100% (1/1 Present)");

        // Act 2: No Filter (All Courses)
        List<StudentDetailDTO> resultAll = teacherStudentService.getTeacherStudents(teacherId, null, null);

        // Assert 2
        assertEquals(1, resultAll.size());
        assertEquals(50.0, resultAll.get(0).getAttendancePercentage(), "Should be 50% (1/2 Present)");
    }
}
