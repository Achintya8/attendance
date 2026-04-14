package com.college.attendance.repository;

import com.college.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findBySessionId(Long sessionId);
    List<Attendance> findByStudentId(Long studentId);

    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId AND a.session.date BETWEEN :from AND :to")
    List<Attendance> findByStudentIdAndDateRange(
            @Param("studentId") Long studentId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId AND a.session.course.id = :courseId AND a.session.date BETWEEN :from AND :to")
    List<Attendance> findByStudentIdAndCourseIdAndDateRange(
            @Param("studentId") Long studentId,
            @Param("courseId") Long courseId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT a FROM Attendance a WHERE a.session.teacher.id = :teacherId AND a.session.date BETWEEN :from AND :to")
    List<Attendance> findByTeacherIdAndDateRange(
            @Param("teacherId") Long teacherId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT a FROM Attendance a WHERE a.session.teacher.id = :teacherId AND a.session.course.id = :courseId AND a.session.date BETWEEN :from AND :to")
    List<Attendance> findByTeacherCourseAndDateRange(
            @Param("teacherId") Long teacherId,
            @Param("courseId") Long courseId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
