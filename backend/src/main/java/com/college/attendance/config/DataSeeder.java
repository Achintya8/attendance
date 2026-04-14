package com.college.attendance.config;

import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, DepartmentRepository departmentRepository,
                      CourseRepository courseRepository, TeacherRepository teacherRepository,
                      StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }

        // 1. Create Users
        User adminUser = new User(null, "admin", passwordEncoder.encode("admin"), Role.ADMIN);
        adminUser.setPasswordChanged(true);
        userRepository.save(adminUser);

        User teacherUser = new User(null, "teacher1", passwordEncoder.encode("teacher1"), Role.TEACHER);
        teacherUser.setPasswordChanged(true);
        teacherUser = userRepository.save(teacherUser);

        User studentUser = new User(null, "student1", passwordEncoder.encode("student1"), Role.STUDENT);
        studentUser.setPasswordChanged(true);
        studentUser = userRepository.save(studentUser);

        // 2. Create Departments (Needed for Teachers/Students)
        Department mca = departmentRepository.save(new Department(null, "Master of Computer Applications", "MCA"));

        // 3. Create Teacher
        Teacher teacher = teacherRepository.save(new Teacher(null, "Teacher One", "teacher1@college.edu", mca, teacherUser));

        // 4. Create Student
        Student student = studentRepository.save(new Student(null, "MCA01", "Student One", "student1@college.edu", 1, "A", 2023, "2023-2025", mca, studentUser));

        System.out.println("Clean database seeded with admin, teacher1, and student1.");
    }
}
