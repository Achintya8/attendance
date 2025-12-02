package com.college.attendance.service;

import com.college.attendance.entity.Student;
import com.college.attendance.entity.Teacher;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${notification.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${notification.email.from:noreply@attendance.com}")
    private String emailFrom;

    @Value("${notification.fcm.enabled:false}")
    private boolean fcmEnabled;

    public void sendTeacherReminder(Teacher teacher, String message) {
        if (fcmEnabled && teacher.getFcmToken() != null && !teacher.getFcmToken().isEmpty()) {
            try {
                sendFCMNotification(teacher.getFcmToken(), "Attendance Reminder", message);
                logger.info("FCM notification sent to teacher: {}", teacher.getName());
            } catch (Exception e) {
                logger.error("Failed to send FCM notification to {}: {}", teacher.getName(), e.getMessage());
                logNotification("TEACHER", teacher.getName(), message);
            }
        } else {
            // Fallback to logging
            logNotification("TEACHER", teacher.getName(), message);
        }
    }

    public void sendStudentReport(Student student, String report) {
        if (emailEnabled) {
            try {
                sendEmail(student.getEmail(), "Monthly Attendance Report", report);
                logger.info("Email sent to student: {} ({})", student.getName(), student.getEmail());
            } catch (Exception e) {
                logger.error("Failed to send email to {}: {}", student.getEmail(), e.getMessage());
                logNotification("STUDENT", student.getName() + " (" + student.getEmail() + ")", report);
            }
        } else {
            // Fallback to logging
            logNotification("STUDENT", student.getName() + " (" + student.getEmail() + ")", report);
        }
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(emailFrom);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    private void sendFCMNotification(String token, String title, String body) throws Exception {
        Message message = Message.builder()
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .setToken(token)
                .build();

        String response = FirebaseMessaging.getInstance().send(message);
        logger.debug("FCM response: {}", response);
    }

    private void logNotification(String type, String recipient, String message) {
        logger.info("=================================================");
        logger.info("NOTIFICATION TO {}: {}", type, recipient);
        logger.info("MESSAGE: {}", message);
        logger.info("=================================================");
    }
}
