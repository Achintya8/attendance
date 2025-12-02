package com.college.attendance.repository;

import com.college.attendance.entity.StudentCourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCourseEnrollmentRepository extends JpaRepository<StudentCourseEnrollment, Long> {
    
    @Query("SELECT sce.student.id FROM StudentCourseEnrollment sce WHERE sce.course.id = :courseId")
    List<Long> findStudentIdsByCourseId(@Param("courseId") Long courseId);

    List<StudentCourseEnrollment> findByCourseId(Long courseId);
    
    List<StudentCourseEnrollment> findByStudentId(Long studentId);
}
