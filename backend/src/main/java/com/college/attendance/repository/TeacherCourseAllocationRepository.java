package com.college.attendance.repository;

import com.college.attendance.entity.TeacherCourseAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeacherCourseAllocationRepository extends JpaRepository<TeacherCourseAllocation, Long> {
    List<TeacherCourseAllocation> findByTeacherId(Long teacherId);
    List<TeacherCourseAllocation> findByCourseId(Long courseId);
}
