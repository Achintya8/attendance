package com.college.attendance.controller;

import com.college.attendance.entity.MasterTimetable;
import com.college.attendance.entity.Teacher;
import com.college.attendance.repository.MasterTimetableRepository;
import com.college.attendance.repository.TeacherRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    private final MasterTimetableRepository masterTimetableRepository;
    private final TeacherRepository teacherRepository;
    private final com.college.attendance.repository.UserRepository userRepository;

    public DebugController(MasterTimetableRepository masterTimetableRepository, TeacherRepository teacherRepository,
            com.college.attendance.repository.UserRepository userRepository) {
        this.masterTimetableRepository = masterTimetableRepository;
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/timetable")
    public Map<String, Object> getTimetableDebugInfo() {
        Map<String, Object> result = new HashMap<>();

        List<Teacher> teachers = teacherRepository.findAll();
        result.put("teacherCount", teachers.size());
        result.put("teachers",
                teachers.stream().map(t -> t.getName() + " (" + t.getEmail() + ")").collect(Collectors.toList()));

        List<MasterTimetable> timetable = masterTimetableRepository.findAll();
        result.put("timetableCount", timetable.size());
        result.put("entries",
                timetable.stream().map(t -> String.format("Day: %s, Period: %d, Course: %s, Teacher: %s, Section: %s",
                        t.getDayOfWeek(), t.getPeriod(), t.getCourse().getCode(), t.getTeacher().getEmail(),
                        t.getSection())).collect(Collectors.toList()));

        return result;
    }

    @GetMapping("/fix-timetable")
    public String fixTimetable() {
        Teacher jane = teacherRepository.findByEmail("jane@college.edu")
                .orElseThrow(() -> new RuntimeException("Jane not found"));

        Teacher oldTeacher = teacherRepository.findByEmail("teacher@college.edu")
                .orElse(null);

        if (oldTeacher == null)
            return "Old teacher not found";

        List<MasterTimetable> entries = masterTimetableRepository.findByTeacher(oldTeacher);
        for (MasterTimetable mt : entries) {
            mt.setTeacher(jane);
        }
        masterTimetableRepository.saveAll(entries);

        return "Updated " + entries.size() + " entries to be taught by Jane";
    }

    @GetMapping("/assign-timetable")
    public String assignTimetable(@RequestParam String email, @RequestParam String courseCode) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + email));

        com.college.attendance.entity.Course course = masterTimetableRepository.findAll().stream()
                .map(MasterTimetable::getCourse)
                .filter(c -> c.getCode().equalsIgnoreCase(courseCode))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseCode));

        // Create a simple schedule: Mon-Fri, Period 1
        int count = 0;
        for (java.time.DayOfWeek day : java.time.DayOfWeek.values()) {
            if (day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY)
                continue;

            MasterTimetable mt = new MasterTimetable();
            mt.setDayOfWeek(day);
            mt.setPeriod(1);
            mt.setCourse(course);
            mt.setTeacher(teacher);
            mt.setSection("A");
            masterTimetableRepository.save(mt);
            count++;
        }

        return "Assigned " + count + " classes of " + courseCode + " to " + email;
    }

    @GetMapping("/check-user")
    public Map<String, Object> checkUser(@RequestParam String username) {
        Map<String, Object> result = new HashMap<>();
        com.college.attendance.entity.User user = userRepository.findByUsername(username).orElse(null);

        if (user != null) {
            result.put("exists", true);
            result.put("username", user.getUsername());
            result.put("role", user.getRole());
            result.put("passwordHash", user.getPassword().substring(0, 10) + "..."); // Show partial hash
        } else {
            result.put("exists", false);
        }
        return result;
    }
}
