package com.college.attendance.entity;

import jakarta.persistence.*;
import java.time.DayOfWeek;

@Entity
@Table(name = "master_timetable")
public class MasterTimetable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(nullable = false)
    private Integer period; // 1, 2, 3...

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(nullable = false)
    private String section; // "A", "B", "MERGED"

    public MasterTimetable() {}

    public MasterTimetable(Long id, DayOfWeek dayOfWeek, Integer period, Course course, Teacher teacher, String section) {
        this.id = id;
        this.dayOfWeek = dayOfWeek;
        this.period = period;
        this.course = course;
        this.teacher = teacher;
        this.section = section;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public Integer getPeriod() { return period; }
    public void setPeriod(Integer period) { this.period = period; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
}
