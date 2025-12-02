package com.college.attendance.service;

import com.college.attendance.dto.SessionUpdateRequest;
import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimetableService {

    private final MasterTimetableService masterTimetableService;
    private final ClassSessionRepository classSessionRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;

    public TimetableService(MasterTimetableService masterTimetableService,
            ClassSessionRepository classSessionRepository, TeacherRepository teacherRepository,
            CourseRepository courseRepository) {
        this.masterTimetableService = masterTimetableService;
        this.classSessionRepository = classSessionRepository;
        this.teacherRepository = teacherRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public List<ClassSession> getDailySchedule(LocalDate date, Long teacherId) {
        List<ClassSession> existingSessions = classSessionRepository.findByDateAndTeacherId(date, teacherId);
        if (!existingSessions.isEmpty()) {
            return existingSessions;
        }

        List<MasterTimetable> masterSchedules = masterTimetableService.getTeacherTimetable(teacherId,
                date.getDayOfWeek());

        List<ClassSession> newSessions = masterSchedules.stream().map(mt -> {
            ClassSession session = new ClassSession();
            session.setDate(date);
            session.setPeriod(mt.getPeriod());
            session.setCourse(mt.getCourse());
            session.setTeacher(mt.getTeacher());
            session.setSection(mt.getSection());
            session.setType(SessionType.REGULAR);
            session.setStatus(SessionStatus.SCHEDULED);
            return session;
        }).collect(Collectors.toList());

        return classSessionRepository.saveAll(newSessions);
    }

    @Transactional
    public ClassSession addExtraClass(LocalDate date, Integer period, Long courseId, Long teacherId, String section) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow();

        ClassSession session = new ClassSession();
        session.setDate(date);
        session.setPeriod(period);
        session.setCourse(course);
        session.setTeacher(teacher);
        session.setSection(section);
        session.setType(SessionType.EXTRA);
        session.setStatus(SessionStatus.SCHEDULED);

        return classSessionRepository.save(session);
    }

    @Transactional
    public ClassSession updateSession(Long sessionId, SessionUpdateRequest request) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (request.getDate() != null)
            session.setDate(request.getDate());
        if (request.getPeriod() != null)
            session.setPeriod(request.getPeriod());
        if (request.getSection() != null)
            session.setSection(request.getSection());

        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            session.setCourse(course);
        }

        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            session.setTeacher(teacher);
        }

        if (request.getType() != null) {
            session.setType(SessionType.valueOf(request.getType()));
        }

        if (request.getStatus() != null) {
            session.setStatus(SessionStatus.valueOf(request.getStatus()));
        }

        return classSessionRepository.save(session);
    }

    @Transactional
    public ClassSession cancelSession(Long sessionId) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setStatus(SessionStatus.CANCELLED);
        return classSessionRepository.save(session);
    }

    @Transactional
    public ClassSession substituteTeacher(Long sessionId, Long newTeacherId) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        Teacher newTeacher = teacherRepository.findById(newTeacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        session.setTeacher(newTeacher);
        session.setType(SessionType.SUBSTITUTION);

        return classSessionRepository.save(session);
    }
}
