package com.college.attendance.controller;

import com.college.attendance.entity.Teacher;
import com.college.attendance.entity.User;
import com.college.attendance.repository.TeacherRepository;
import com.college.attendance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    public NotificationController(TeacherRepository teacherRepository, UserRepository userRepository) {
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/register-fcm")
    public ResponseEntity<String> registerFCMToken(@RequestBody Map<String, String> request, Authentication authentication) {
        String fcmToken = request.get("fcmToken");
        
        if (fcmToken == null || fcmToken.isEmpty()) {
            return ResponseEntity.badRequest().body("FCM token is required");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find teacher by user
        Teacher teacher = teacherRepository.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Teacher not found for this user"));

        teacher.setFcmToken(fcmToken);
        teacherRepository.save(teacher);

        return ResponseEntity.ok("FCM token registered successfully");
    }

    @DeleteMapping("/unregister-fcm")
    public ResponseEntity<String> unregisterFCMToken(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Teacher teacher = teacherRepository.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Teacher not found for this user"));

        teacher.setFcmToken(null);
        teacherRepository.save(teacher);

        return ResponseEntity.ok("FCM token unregistered successfully");
    }
}
