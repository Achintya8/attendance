package com.college.attendance.repository;

import com.college.attendance.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByDateAndTeacherId(LocalDate date, Long teacherId);
    List<ClassSession> findByDateAndCourseIdAndSection(LocalDate date, Long courseId, String section);
    List<ClassSession> findByDateAndStatus(LocalDate date, com.college.attendance.entity.SessionStatus status);
}
