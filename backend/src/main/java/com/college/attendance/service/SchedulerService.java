package com.college.attendance.service;

import com.college.attendance.entity.ClassSession;
import com.college.attendance.entity.SessionStatus;
import com.college.attendance.entity.Student;
import com.college.attendance.repository.ClassSessionRepository;
import com.college.attendance.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
public class SchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(SchedulerService.class);

    @Autowired
    private ClassSessionRepository classSessionRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AttendanceService attendanceService;


    // Hardcoded period times to match Frontend
    private static final Map<Integer, TimeSlot> PERIOD_TIMES = Map.of(
            1, new TimeSlot(LocalTime.of(9, 0), LocalTime.of(10, 0)),
            2, new TimeSlot(LocalTime.of(10, 0), LocalTime.of(11, 0)),
            3, new TimeSlot(LocalTime.of(11, 30), LocalTime.of(12, 30)),
            4, new TimeSlot(LocalTime.of(12, 30), LocalTime.of(13, 30)),
            5, new TimeSlot(LocalTime.of(14, 30), LocalTime.of(15, 30)),
            6, new TimeSlot(LocalTime.of(15, 30), LocalTime.of(16, 30))
    );

    private static class TimeSlot {
        LocalTime start;
        LocalTime end;

        TimeSlot(LocalTime start, LocalTime end) {
            this.start = start;
            this.end = end;
        }
    }

    // Run every minute to check for class reminders
    @Scheduled(fixedRate = 60000)
    @Transactional(readOnly = true)
    public void checkTeacherReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<ClassSession> todaysSessions = classSessionRepository.findByDateAndStatus(today, SessionStatus.SCHEDULED);

        for (ClassSession session : todaysSessions) {
            TimeSlot slot = PERIOD_TIMES.get(session.getPeriod());
            if (slot == null) continue;

            // 1. Reminder 5 mins after start
            if (isTimeMatch(now, slot.start.plusMinutes(5))) {
                notificationService.sendTeacherReminder(session.getTeacher(),
                        "Reminder: Your class for " + session.getCourse().getName() + 
                        " (Period " + session.getPeriod() + ") started 5 minutes ago. Please take attendance.");
            }

            // 2. Reminder 5 mins before end
            if (isTimeMatch(now, slot.end.minusMinutes(5))) {
                notificationService.sendTeacherReminder(session.getTeacher(),
                        "Urgent: Your class for " + session.getCourse().getName() + 
                        " (Period " + session.getPeriod() + ") ends in 5 minutes. Please take attendance if you haven't already.");
            }
        }
    }

    private boolean isTimeMatch(LocalTime current, LocalTime target) {
        // Match if current time is within the same minute as target
        return current.getHour() == target.getHour() && current.getMinute() == target.getMinute();
    }

    // Run on the last day of every month at 12:00 PM
    @Scheduled(cron = "0 0 12 L * ?")
    @Transactional(readOnly = true)
    public void generateMonthlyStudentReports() {
        logger.info("Starting monthly student attendance report generation...");
        List<Student> students = studentRepository.findAll();

        for (Student student : students) {
            // Recalculate attendance to ensure fresh data
            Map<String, Object> stats = attendanceService.getStudentAttendanceStats(student.getId());
            double overallPercentage = (double) stats.get("attendancePercentage");

            // Check if shortage is less than 85% (as per requirement "shortage is less than 85%")
            // Assuming requirement means "Attendance is less than 85%"
            if (overallPercentage < 85.0) {
                String report = String.format(
                        "Dear %s,\n\nYour attendance for this month is %.1f%%, which is below the required 85%%.\n" +
                        "Please contact your department for more details.\n\n" +
                        "Summary:\nPresent: %d\nAbsent: %d\nOn Duty: %d\nMedical: %d",
                        student.getName(),
                        overallPercentage,
                        stats.get("present"),
                        stats.get("absent"),
                        stats.get("onDuty"),
                        stats.get("medical")
                );
                notificationService.sendStudentReport(student, report);
            }
        }
        logger.info("Monthly student attendance report generation completed.");
    }
}
