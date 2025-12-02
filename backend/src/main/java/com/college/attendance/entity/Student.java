package com.college.attendance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String rollNum;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private String section; // e.g., "A", "B"

    @Column(nullable = false)
    private Integer admissionYear; // e.g., 2023, 2024

    @Column(nullable = false)
    private String currentBatch; // e.g., "2023-2027", "2024-2028"

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Student() {}

    public Student(Long id, String rollNum, String name, String email, Department department, Integer semester, String section, Integer admissionYear, String currentBatch, User user) {
        this.id = id;
        this.rollNum = rollNum;
        this.name = name;
        this.email = email;
        this.department = department;
        this.semester = semester;
        this.section = section;
        this.admissionYear = admissionYear;
        this.currentBatch = currentBatch;
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRollNum() { return rollNum; }
    public void setRollNum(String rollNum) { this.rollNum = rollNum; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public Integer getAdmissionYear() { return admissionYear; }
    public void setAdmissionYear(Integer admissionYear) { this.admissionYear = admissionYear; }

    public String getCurrentBatch() { return currentBatch; }
    public void setCurrentBatch(String currentBatch) { this.currentBatch = currentBatch; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
