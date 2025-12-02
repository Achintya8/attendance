package com.college.attendance.controller;

import com.college.attendance.service.DataImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final DataImportService dataImportService;

    public AdminController(DataImportService dataImportService) {
        this.dataImportService = dataImportService;
    }

    @PostMapping("/import/students")
    public ResponseEntity<String> importStudents(@RequestParam("file") MultipartFile file) {
        try {
            dataImportService.importStudents(file);
            return ResponseEntity.ok("Students import started. Processing in background...");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/import/teachers")
    public ResponseEntity<String> importTeachers(@RequestParam("file") MultipartFile file) {
        try {
            dataImportService.importTeachers(file);
            return ResponseEntity.ok("Teachers import started. Processing in background...");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/import/timetable")
    public ResponseEntity<String> importTimetable(@RequestParam("file") MultipartFile file) {
        try {
            dataImportService.importMasterTimetable(file);
            return ResponseEntity.ok("Timetable import started. Processing in background...");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/import/electives")
    public ResponseEntity<String> importElectives(@RequestParam("file") MultipartFile file) {
        try {
            dataImportService.importElectives(file);
            return ResponseEntity.ok("Electives import started. Processing in background...");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
