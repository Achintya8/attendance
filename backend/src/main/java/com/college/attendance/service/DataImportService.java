package com.college.attendance.service;

import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class DataImportService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final MasterTimetableRepository masterTimetableRepository;
    private final StudentElectiveMappingRepository studentElectiveMappingRepository;
    private final StudentCourseEnrollmentRepository studentCourseEnrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataImportService(StudentRepository studentRepository, TeacherRepository teacherRepository,
            DepartmentRepository departmentRepository, CourseRepository courseRepository, UserRepository userRepository,
            MasterTimetableRepository masterTimetableRepository,
            StudentElectiveMappingRepository studentElectiveMappingRepository,
            StudentCourseEnrollmentRepository studentCourseEnrollmentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.masterTimetableRepository = masterTimetableRepository;
        this.studentElectiveMappingRepository = studentElectiveMappingRepository;
        this.studentCourseEnrollmentRepository = studentCourseEnrollmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CompletableFuture<String> importTeachers(MultipartFile file) throws IOException {
        System.out.println("Starting importTeachers...");
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter dataFormatter = new DataFormatter();
            List<Teacher> teachers = new ArrayList<>();
            List<User> users = new ArrayList<>();
            Map<String, Department> deptCache = new HashMap<>();

            // Pre-load departments
            departmentRepository.findAll().forEach(d -> {
                deptCache.put(d.getName().toUpperCase(), d);
                if (d.getCode() != null)
                    deptCache.put(d.getCode().toUpperCase(), d);
            });

            for (Row row : sheet) {
                if (row.getRowNum() == 0)
                    continue;

                String name = dataFormatter.formatCellValue(row.getCell(0)).trim();
                String email = dataFormatter.formatCellValue(row.getCell(1)).trim().toLowerCase();
                String deptName = dataFormatter.formatCellValue(row.getCell(2)).trim();

                if (name.isEmpty() || email.isEmpty())
                    continue;

                Department dept = deptCache.computeIfAbsent(deptName.toUpperCase(), k -> {
                    String code = deptName.length() >= 3 ? deptName.substring(0, 3).toUpperCase()
                            : deptName.toUpperCase();
                    return departmentRepository.save(new Department(null, deptName, code));
                });

                User user = new User();
                user.setUsername(email);
                user.setPassword(passwordEncoder.encode("welcome123"));
                user.setRole(Role.TEACHER);
                user.setPasswordChanged(false);
                users.add(user);

                Teacher teacher = new Teacher();
                teacher.setName(name);
                teacher.setEmail(email);
                teacher.setDepartment(dept);
                teacher.setUser(user);
                teachers.add(teacher);
            }

            userRepository.saveAll(users);
            teacherRepository.saveAll(teachers);

            return CompletableFuture.completedFuture("Imported " + teachers.size() + " teachers successfully");
        }
    }

    @Transactional
    public CompletableFuture<String> importStudents(MultipartFile file) throws IOException {
        long startTime = System.currentTimeMillis();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter dataFormatter = new DataFormatter();

            // Cache Departments
            Map<String, Department> deptCache = new HashMap<>();
            departmentRepository.findAll().forEach(d -> {
                deptCache.put(d.getName().toUpperCase(), d);
                if (d.getCode() != null)
                    deptCache.put(d.getCode().toUpperCase(), d);
            });

            List<StudentImportData> importDataList = new ArrayList<>();

            for (Row row : sheet) {
                if (row.getRowNum() == 0)
                    continue;

                String rollNum = dataFormatter.formatCellValue(row.getCell(0)).trim().toUpperCase();
                String name = dataFormatter.formatCellValue(row.getCell(1)).trim();
                String email = dataFormatter.formatCellValue(row.getCell(2)).trim().toLowerCase();
                String deptName = dataFormatter.formatCellValue(row.getCell(3)).trim();
                String semesterStr = dataFormatter.formatCellValue(row.getCell(4)).trim();
                String section = dataFormatter.formatCellValue(row.getCell(5)).trim();
                String admissionYearStr = dataFormatter.formatCellValue(row.getCell(6)).trim();
                String currentBatch = dataFormatter.formatCellValue(row.getCell(7)).trim();

                if (rollNum.isEmpty() || name.isEmpty())
                    continue;

                Department dept = deptCache.computeIfAbsent(deptName.toUpperCase(), k -> {
                    String code = deptName.length() >= 3 ? deptName.substring(0, 3).toUpperCase()
                            : deptName.toUpperCase();
                    return departmentRepository.save(new Department(null, deptName, code));
                });

                int semester = semesterStr.isEmpty() ? 1 : Integer.parseInt(semesterStr);
                int admissionYear = admissionYearStr.isEmpty() ? java.time.Year.now().getValue() - 3
                        : Integer.parseInt(admissionYearStr);
                if (currentBatch.isEmpty()) {
                    currentBatch = admissionYear + "-" + (admissionYear + 4);
                }

                importDataList.add(new StudentImportData(rollNum, name, email, dept, semester, section, admissionYear,
                        currentBatch));
            }

            // Parallel processing for hashing passwords (significant performance boost)
            importDataList.parallelStream().forEach(data -> {
                User user = new User();
                user.setUsername(data.rollNum);
                user.setPassword(passwordEncoder.encode("welcome123")); // Heavy operation
                user.setRole(Role.STUDENT);
                user.setPasswordChanged(false);
                data.user = user;
            });

            // Batch Save
            List<User> users = importDataList.stream().map(d -> d.user).collect(Collectors.toList());
            userRepository.saveAll(users);

            List<Student> students = importDataList.stream().map(data -> {
                Student student = new Student();
                student.setRollNum(data.rollNum);
                student.setName(data.name);
                student.setEmail(data.email);
                student.setDepartment(data.dept);
                student.setSemester(data.semester);
                student.setSection(data.section);
                student.setAdmissionYear(data.admissionYear);
                student.setCurrentBatch(data.currentBatch);
                student.setUser(data.user);
                return student;
            }).collect(Collectors.toList());

            studentRepository.saveAll(students);

            System.out.println(
                    "Imported " + students.size() + " students in " + (System.currentTimeMillis() - startTime) + "ms");
            return CompletableFuture.completedFuture("Imported " + students.size() + " students successfully");
        }
    }

    private static class StudentImportData {
        String rollNum;
        String name;
        String email;
        Department dept;
        int semester;
        String section;
        int admissionYear;
        String currentBatch;
        User user;

        public StudentImportData(String rollNum, String name, String email, Department dept, int semester,
                String section, int admissionYear, String currentBatch) {
            this.rollNum = rollNum;
            this.name = name;
            this.email = email;
            this.dept = dept;
            this.semester = semester;
            this.section = section;
            this.admissionYear = admissionYear;
            this.currentBatch = currentBatch;
        }
    }

    @Transactional
    public CompletableFuture<String> importMasterTimetable(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter dataFormatter = new DataFormatter();
            List<MasterTimetable> timetables = new ArrayList<>();

            for (Row row : sheet) {
                if (row.getRowNum() == 0)
                    continue;

                String dayStr = dataFormatter.formatCellValue(row.getCell(0)).trim();
                String periodStr = dataFormatter.formatCellValue(row.getCell(1)).trim();
                String courseCode = dataFormatter.formatCellValue(row.getCell(2)).trim();
                String teacherEmail = dataFormatter.formatCellValue(row.getCell(3)).trim();
                String section = dataFormatter.formatCellValue(row.getCell(4)).trim();

                // FIX: Default empty section to "MERGED" (implies all enrolled students for
                // electives)
                if (section.isEmpty()) {
                    section = "MERGED";
                }

                if (dayStr.isEmpty() || courseCode.isEmpty())
                    continue;

                java.time.DayOfWeek day = java.time.DayOfWeek.valueOf(dayStr.toUpperCase());
                int period = Integer.parseInt(periodStr);

                Course course = courseRepository.findByCode(courseCode)
                        .orElseThrow(() -> new RuntimeException("Course not found: " + courseCode));
                Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                        .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherEmail));

                MasterTimetable mt = new MasterTimetable();
                mt.setDayOfWeek(day);
                mt.setPeriod(period);
                mt.setCourse(course);
                mt.setTeacher(teacher);
                mt.setSection(section);

                timetables.add(mt);
            }
            masterTimetableRepository.saveAll(timetables);
            return CompletableFuture
                    .completedFuture("Imported " + timetables.size() + " timetable entries successfully");
        }
    }

    @Transactional
    public CompletableFuture<String> importElectives(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter dataFormatter = new DataFormatter();
            List<StudentCourseEnrollment> enrollments = new ArrayList<>();

            // Cache courses and students to minimize DB calls
            Map<String, Course> courseCache = new HashMap<>();

            for (Row row : sheet) {
                if (row.getRowNum() == 0)
                    continue;

                String studentRollNum = dataFormatter.formatCellValue(row.getCell(0)).trim();
                String courseCode = dataFormatter.formatCellValue(row.getCell(1)).trim();

                if (studentRollNum.isEmpty() || courseCode.isEmpty())
                    continue;

                Student student = studentRepository.findByRollNum(studentRollNum)
                        .orElseThrow(() -> new RuntimeException("Student not found: " + studentRollNum));

                Course course = courseCache.computeIfAbsent(courseCode, code -> courseRepository.findByCode(code)
                        .orElseThrow(() -> new RuntimeException("Course not found: " + code)));

                StudentCourseEnrollment enrollment = new StudentCourseEnrollment(student, course);
                enrollments.add(enrollment);
            }
            // But wait, the previous file read (step 91) shows
            // `StudentElectiveMappingRepository` was used.
            // I need to make sure `studentCourseEnrollmentRepository` is available.
            // I will use `studentElectiveMappingRepository` variable if I can't change the
            // field name easily without full file replace,
            // BUT `studentElectiveMappingRepository` is of type
            // `StudentElectiveMappingRepository`.
            // I MUST check if `studentCourseEnrollmentRepository` is in the class fields.
            // The file read showed: `private final StudentElectiveMappingRepository
            // studentElectiveMappingRepository;`
            // It did NOT show `studentCourseEnrollmentRepository`.
            // I MUST ADD the field and update the constructor.
            // Since this tool only acts on a block, I should check if I can do that.
            // Actually, I should use `multi_replace_file_content` to add the field, update
            // constructor, and this method.
            // I will return an error to myself to switch tools.
            studentCourseEnrollmentRepository.saveAll(enrollments);

            return CompletableFuture
                    .completedFuture("Imported " + enrollments.size() + " elective enrollments successfully");
        }
    }
}
