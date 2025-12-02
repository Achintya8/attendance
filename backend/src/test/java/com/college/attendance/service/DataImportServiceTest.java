package com.college.attendance.service;

import com.college.attendance.entity.*;
import com.college.attendance.repository.*;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.ByteArrayOutputStream;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataImportServiceTest {

    @Mock private StudentRepository studentRepository;
    @Mock private TeacherRepository teacherRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private UserRepository userRepository;
    @Mock private MasterTimetableRepository masterTimetableRepository;
    @Mock private StudentElectiveMappingRepository studentElectiveMappingRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private DataImportService dataImportService;

    @BeforeEach
    void setUp() {
        dataImportService = new DataImportService(
                studentRepository, teacherRepository, departmentRepository,
                courseRepository, userRepository, masterTimetableRepository,
                studentElectiveMappingRepository, passwordEncoder
        );
    }

    @Test
    void importStudents_ShouldHandleNumericRollNumbersCorrectly() throws Exception {
        // Arrange
        Department cse = new Department(1L, "Computer Science", "CSE");
        when(departmentRepository.findAll()).thenReturn(List.of(cse));
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");

        // Create Excel with numeric Roll Number
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Students");
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Roll No");

        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue(101.0); // Numeric 101
        row.createCell(1).setCellValue("Test Student");
        row.createCell(2).setCellValue("test@test.com");
        row.createCell(3).setCellValue("CSE");
        row.createCell(4).setCellValue("3");
        row.createCell(5).setCellValue("A");
        row.createCell(6).setCellValue("2023");
        row.createCell(7).setCellValue("2023-2027");

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        byte[] bytes = bos.toByteArray();

        MockMultipartFile file = new MockMultipartFile("file", "students.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes);

        // Act
        dataImportService.importStudents(file).get();

        // Assert
        ArgumentCaptor<List<User>> userCaptor = ArgumentCaptor.forClass(List.class);
        verify(userRepository).saveAll(userCaptor.capture());

        List<User> savedUsers = userCaptor.getValue();
        assertEquals(1, savedUsers.size());
        User user = savedUsers.get(0);
        assertEquals("101", user.getUsername(), "Username should be '101' not '101.0'");

        ArgumentCaptor<List<Student>> studentCaptor = ArgumentCaptor.forClass(List.class);
        verify(studentRepository).saveAll(studentCaptor.capture());
        List<Student> savedStudents = studentCaptor.getValue();
        assertEquals("101", savedStudents.get(0).getRollNum(), "Roll Number should be '101'");
    }

    @Test
    void importStudents_ShouldHandleAlphanumericRollNumbers() throws Exception {
        // Arrange
        Department mca = new Department(1L, "MCA", "MCA");
        when(departmentRepository.findAll()).thenReturn(List.of(mca));
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");

        // Create Excel with alphanumeric Roll Number
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Students");
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Roll No");

        Row row = sheet.createRow(1);
        row.createCell(0).setCellValue("RVCE2025MCA020"); // String Roll Number
        row.createCell(1).setCellValue("Test Student");
        row.createCell(2).setCellValue("test@test.com");
        row.createCell(3).setCellValue("MCA");
        row.createCell(4).setCellValue("1");
        row.createCell(5).setCellValue("A");
        row.createCell(6).setCellValue("2025");
        row.createCell(7).setCellValue("2025-2027");

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        byte[] bytes = bos.toByteArray();

        MockMultipartFile file = new MockMultipartFile("file", "students_alpha.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes);

        // Act
        dataImportService.importStudents(file).get();

        // Assert
        ArgumentCaptor<List<User>> userCaptor = ArgumentCaptor.forClass(List.class);
        verify(userRepository).saveAll(userCaptor.capture());

        List<User> savedUsers = userCaptor.getValue();
        assertEquals(1, savedUsers.size());
        User user = savedUsers.get(0);
        assertEquals("RVCE2025MCA020", user.getUsername(), "Username should be 'RVCE2025MCA020'");

        ArgumentCaptor<List<Student>> studentCaptor = ArgumentCaptor.forClass(List.class);
        verify(studentRepository).saveAll(studentCaptor.capture());
        List<Student> savedStudents = studentCaptor.getValue();
        assertEquals("RVCE2025MCA020", savedStudents.get(0).getRollNum(), "Roll Number should match");
    }
}
