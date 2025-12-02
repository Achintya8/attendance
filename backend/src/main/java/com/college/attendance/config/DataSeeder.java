package com.college.attendance.config;

import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final MasterTimetableRepository masterTimetableRepository;
    private final ClassSessionRepository classSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentCourseEnrollmentRepository studentCourseEnrollmentRepository;

    public DataSeeder(UserRepository userRepository, DepartmentRepository departmentRepository,
                      CourseRepository courseRepository, TeacherRepository teacherRepository,
                      StudentRepository studentRepository, MasterTimetableRepository masterTimetableRepository,
                      ClassSessionRepository classSessionRepository, PasswordEncoder passwordEncoder,
                      StudentCourseEnrollmentRepository studentCourseEnrollmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.masterTimetableRepository = masterTimetableRepository;
        this.classSessionRepository = classSessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentCourseEnrollmentRepository = studentCourseEnrollmentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("Data already seeded!");
            return;
        }

        // 1. Create Users
        User adminUser = new User(null, "admin", passwordEncoder.encode("admin"), Role.ADMIN);
        adminUser.setPasswordChanged(true);
        userRepository.save(adminUser);

        User teacherUser = new User(null, "teacher", passwordEncoder.encode("teacher"), Role.TEACHER);
        teacherUser.setPasswordChanged(true);
        teacherUser = userRepository.save(teacherUser);

        // User studentUser = new User(null, "student", passwordEncoder.encode("student"), Role.STUDENT);
        // studentUser.setPasswordChanged(true);
        // studentUser = userRepository.save(studentUser);

        // 2. Create Departments
        Department mca = departmentRepository.save(new Department(null, "Master of Computer Applications", "MCA"));
        Department ece = departmentRepository.save(new Department(null, "Electronics & Communication Engineering", "ECE"));
        Department cse = departmentRepository.save(new Department(null, "Computer Science & Engineering", "CSE"));
        Department mech = departmentRepository.save(new Department(null, "Mechanical Engineering", "MECH"));
        Department chem = departmentRepository.save(new Department(null, "Chemistry", "CHEM"));
        Department math = departmentRepository.save(new Department(null, "Mathematics", "MATH"));
        Department ds = departmentRepository.save(new Department(null, "Computer Science & Engineering (Data Science)", "DS"));
        Department ai = departmentRepository.save(new Department(null, "Artificial Intelligence and Machine Learning", "AI"));

        // New Departments
        Department ase = departmentRepository.save(new Department(null, "Aerospace Engineering", "ASE"));
        Department bt = departmentRepository.save(new Department(null, "Biotechnology", "BT"));
        Department ch = departmentRepository.save(new Department(null, "Chemical Engineering", "CH"));
        Department cv = departmentRepository.save(new Department(null, "Civil Engineering", "CV"));
        Department eee = departmentRepository.save(new Department(null, "Electrical & Electronics Engineering", "EEE"));
        Department eie = departmentRepository.save(new Department(null, "Electronics & Instrumentation Engineering", "EIE"));
        Department ete = departmentRepository.save(new Department(null, "Electronics & Telecommunication Engineering", "ETE"));
        Department iem = departmentRepository.save(new Department(null, "Industrial Engineering & Management", "IEM"));
        Department ise = departmentRepository.save(new Department(null, "Information Science & Engineering", "ISE"));
        Department cy = departmentRepository.save(new Department(null, "Computer Science & Engineering (Cyber Security)", "CY"));
        Department phy = departmentRepository.save(new Department(null, "Physics", "PHY"));
        Department hum = departmentRepository.save(new Department(null, "Humanities", "HUM"));

        // 3. Create Courses
        Course java = courseRepository.save(new Course(null, "Java Programming", "MCA113IA", mca, 1, CourseType.CORE));
        Course wad = courseRepository.save(new Course(null, "Web Application Development", "MCA112IA", mca, 1, CourseType.CORE));
        Course computerNetworks = courseRepository.save(new Course(null, "Computer Networks", "MCA114A2", mca, 1, CourseType.ELECTIVE));
        Course dataScience = courseRepository.save(new Course(null, "Data Science", "MCA115A1", mca, 1, CourseType.ELECTIVE));
        Course devOps = courseRepository.save(new Course(null, "DevOps", "MCA116A1", mca, 3, CourseType.CORE));
        Course fullStack = courseRepository.save(new Course(null, "Full Stack Development", "MCA117A1", mca, 3, CourseType.CORE));
        Course aws = courseRepository.save(new Course(null, "AWS", "MCA118A1", mca, 3, CourseType.ELECTIVE));
        Course powerBI = courseRepository.save(new Course(null, "Power BI", "MCA119A1", mca, 3, CourseType.ELECTIVE));

        // CSE Courses
        Course cseJava = courseRepository.save(new Course(null, "Advanced Java", "CSE101", cse, 3, CourseType.CORE));
        Course cseAlgo = courseRepository.save(new Course(null, "Algorithms", "CSE102", cse, 3, CourseType.CORE));

        // 4. Create Teachers
        Teacher teacher = teacherRepository.save(new Teacher(null, "John Doe", "teacher@college.edu", cse, teacherUser));

        User mcaTeacherUser = new User(null, "mcateacher", passwordEncoder.encode("teacher"), Role.TEACHER);
        mcaTeacherUser.setPasswordChanged(true);
        mcaTeacherUser = userRepository.save(mcaTeacherUser);
        Teacher mcaTeacher = teacherRepository.save(new Teacher(null, "Jane MCA", "mcateacher@college.edu", mca, mcaTeacherUser));

        // 5. Create Students (with batch tracking)
        // Student s1 = studentRepository.save(new Student(null, "S101", "Alice Smith", "student@college.edu", cse, 3, "A", 2023, "2023-2027", studentUser));

        // User mcaStudentUser = new User(null, "mcastudent", passwordEncoder.encode("student"), Role.STUDENT);
        // mcaStudentUser.setPasswordChanged(true);
        // mcaStudentUser = userRepository.save(mcaStudentUser);

        // Student m1 = studentRepository.save(new Student(null, "M101", "Mike MCA", "mike@college.edu", mca, 1, "A", 2023, "2025-2027", mcaStudentUser));
        // Student m2 = studentRepository.save(new Student(null, "M102", "Molly MCA", "molly@college.edu", mca, 1, "A", 2023, "2025-2027", null));
        // Student s2 = studentRepository.save(new Student(null, "S102", "Bob Jones", "bob@college.edu", cse, 3, "A", 2023, "2023-2027", null));
        // Student s3 = studentRepository.save(new Student(null, "S103", "Charlie Brown", "charlie@college.edu", cse, 3, "A", 2023, "2023-2027", null));
        // Student s4 = studentRepository.save(new Student(null, "S104", "David White", "david@college.edu", cse, 3, "B", 2023, "2023-2027", null));

        // 6. Enroll Students in Elective (Only Alice and Charlie)
        //studentCourseEnrollmentRepository.save(new StudentCourseEnrollment(s1, electiveCourse));
        //studentCourseEnrollmentRepository.save(new StudentCourseEnrollment(s3, electiveCourse));

        // Note: Timetable and sessions will be created via Excel upload

        System.out.println("Sample data seeded successfully!");
    }
}
