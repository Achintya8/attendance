package com.college.attendance.config;

import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class UserFixer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserFixer(StudentRepository studentRepository, TeacherRepository teacherRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        fixStudents();
        fixTeachers();
    }

    private void fixStudents() {
        List<Student> students = studentRepository.findAll();
        int fixedCount = 0;
        for (Student student : students) {
            if (student.getUser() == null) {
                // Check if user already exists (to avoid duplicates if partial state)
                if (userRepository.findByUsername(student.getRollNum()).isPresent()) {
                    User existingUser = userRepository.findByUsername(student.getRollNum()).get();
                    student.setUser(existingUser);
                } else {
                    User user = new User();
                    user.setUsername(student.getRollNum());
                    user.setPassword(passwordEncoder.encode("welcome123"));
                    user.setRole(Role.STUDENT);
                    user.setPasswordChanged(false);
                    user = userRepository.save(user);
                    student.setUser(user);
                }
                studentRepository.save(student);
                fixedCount++;
            }
        }
        if (fixedCount > 0) {
            System.out.println("UserFixer: Created users for " + fixedCount + " students.");
        }
    }

    private void fixTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();
        System.out.println("UserFixer: Found " + teachers.size() + " total teachers in database.");
        int fixedCount = 0;
        for (Teacher teacher : teachers) {
            System.out.println("Checking teacher: " + teacher.getEmail() + ", User: " + (teacher.getUser() != null ? teacher.getUser().getUsername() : "NULL"));
            if (teacher.getUser() == null) {
                if (userRepository.findByUsername(teacher.getEmail()).isPresent()) {
                    User existingUser = userRepository.findByUsername(teacher.getEmail()).get();
                    teacher.setUser(existingUser);
                } else {
                    User user = new User();
                    user.setUsername(teacher.getEmail());
                    user.setPassword(passwordEncoder.encode("welcome123"));
                    user.setRole(Role.TEACHER);
                    user.setPasswordChanged(false);
                    user = userRepository.save(user);
                    teacher.setUser(user);
                }
                teacherRepository.save(teacher);
                fixedCount++;
            }
        }
        if (fixedCount > 0) {
            System.out.println("UserFixer: Created users for " + fixedCount + " teachers.");
        }
    }
}
