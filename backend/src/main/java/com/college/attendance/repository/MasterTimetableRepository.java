package com.college.attendance.repository;

import com.college.attendance.entity.MasterTimetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.DayOfWeek;

@Repository
public interface MasterTimetableRepository extends JpaRepository<MasterTimetable, Long> {
    List<MasterTimetable> findByDayOfWeek(DayOfWeek dayOfWeek);

    List<MasterTimetable> findByTeacherIdAndDayOfWeek(Long teacherId, DayOfWeek dayOfWeek);

    List<MasterTimetable> findByTeacher(com.college.attendance.entity.Teacher teacher);
}
