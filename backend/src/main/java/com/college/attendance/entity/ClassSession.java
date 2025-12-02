package com.college.attendance.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "class_sessions")
public class ClassSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer period;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(nullable = false)
    private String section;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionType type; // REGULAR, EXTRA, SUBSTITUTION

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status; // SCHEDULED, COMPLETED, CANCELLED

    public ClassSession() {}

    public ClassSession(Long id, LocalDate date, Integer period, Course course, Teacher teacher, String section, SessionType type, SessionStatus status) {
        this.id = id;
        this.date = date;
        this.period = period;
        this.course = course;
        this.teacher = teacher;
        this.section = section;
        this.type = type;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Integer getPeriod() { return period; }
    public void setPeriod(Integer period) { this.period = period; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public SessionType getType() { return type; }
    public void setType(SessionType type) { this.type = type; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }
}
