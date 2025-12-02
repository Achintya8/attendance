package com.college.attendance.controller;

import com.college.attendance.dto.LoginRequest;
import com.college.attendance.dto.LoginResponse;
import com.college.attendance.entity.Teacher;
import com.college.attendance.entity.Student;
import com.college.attendance.entity.User;
import com.college.attendance.repository.UserRepository;
import com.college.attendance.repository.TeacherRepository;
import com.college.attendance.repository.StudentRepository;
import com.college.attendance.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, TeacherRepository teacherRepository, 
                         StudentRepository studentRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login attempt for: " + loginRequest.getUsername());

        // Try finding by username (Roll No for students, Email for teachers/admin)
        Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
        
        // If not found, try finding by Email (case insensitive via code logic, or lowercase match)
        if (userOptional.isEmpty()) {
            String email = loginRequest.getUsername().toLowerCase();
            Optional<Student> student = studentRepository.findByEmail(email);
            if (student.isPresent()) {
                System.out.println("Found student by email: " + email);
                userOptional = Optional.of(student.get().getUser());
            } else {
                Optional<Teacher> teacher = teacherRepository.findByEmail(email);
                if (teacher.isPresent()) {
                    System.out.println("Found teacher by email: " + email);
                    userOptional = Optional.of(teacher.get().getUser());
                }
            }
        }

        if (userOptional.isEmpty()) {
            System.out.println("User not found: " + loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        User user = userOptional.get();
        
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            System.out.println("Password mismatch for: " + user.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().toString());
        
        // For teachers and students, return their entity ID, not user ID
        Long entityId = user.getId();
        if (user.getRole() == com.college.attendance.entity.Role.TEACHER) {
            Optional<Teacher> teacher = teacherRepository.findByUser(user);
            entityId = teacher.map(Teacher::getId).orElse(user.getId());
        } else if (user.getRole() == com.college.attendance.entity.Role.STUDENT) {
            Optional<Student> student = studentRepository.findByUser(user);
            entityId = student.map(Student::getId).orElse(user.getId());
        }
        
        LoginResponse response = new LoginResponse(token, user.getUsername(), user.getRole().toString(), entityId, user.isPasswordChanged());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody com.college.attendance.dto.ChangePasswordRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChanged(true);
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }
}
