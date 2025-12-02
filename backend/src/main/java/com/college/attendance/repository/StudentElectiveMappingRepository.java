package com.college.attendance.repository;

import com.college.attendance.entity.StudentElectiveMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentElectiveMappingRepository extends JpaRepository<StudentElectiveMapping, Long> {
}
