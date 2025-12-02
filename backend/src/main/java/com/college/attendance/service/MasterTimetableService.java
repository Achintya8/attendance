package com.college.attendance.service;

import com.college.attendance.entity.MasterTimetable;
import com.college.attendance.repository.MasterTimetableRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;

@Service
public class MasterTimetableService {

    private final MasterTimetableRepository masterTimetableRepository;

    public MasterTimetableService(MasterTimetableRepository masterTimetableRepository) {
        this.masterTimetableRepository = masterTimetableRepository;
    }

    @Cacheable(value = "master_timetable", key = "#teacherId + '_' + #dayOfWeek")
    public List<MasterTimetable> getTeacherTimetable(Long teacherId, DayOfWeek dayOfWeek) {
        return masterTimetableRepository.findByTeacherIdAndDayOfWeek(teacherId, dayOfWeek);
    }
}
