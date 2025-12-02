package com.college.attendance.repository;

import com.college.attendance.entity.Student;
import com.college.attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);

    Optional<Student> findByRollNum(String rollNum);

    List<Student> findByDepartmentNameAndSemesterAndSection(String department, Integer semester, String section);

    List<Student> findBySection(String section);

    List<Student> findByNameContainingIgnoreCaseOrRollNumContainingIgnoreCase(String name, String rollNum);

    Optional<Student> findByUser(User user);

    List<Student> findByDepartmentIdAndSemesterAndSection(Long departmentId, Integer semester, String section);

    List<Student> findByDepartmentId(Long departmentId);

    List<Student> findByDepartmentIdAndSection(Long departmentId, String section);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT s.section FROM Student s WHERE s.department.id = :departmentId ORDER BY s.section")
    List<String> findDistinctSectionsByDepartmentId(Long departmentId);
}
