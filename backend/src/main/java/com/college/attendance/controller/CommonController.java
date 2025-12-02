package com.college.attendance.controller;

import com.college.attendance.entity.Teacher;
import com.college.attendance.repository.TeacherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/common")
@CrossOrigin(origins = "*")
public class CommonController {

    private final TeacherRepository teacherRepository;

    public CommonController(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherRepository.findAll());
    }
}
