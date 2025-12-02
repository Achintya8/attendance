# Attendance Application - Database ER Diagram

This document shows the Entity-Relationship (ER) diagram for the Attendance Application database.

## ER Diagram

```mermaid
erDiagram
    USERS ||--o| STUDENTS : "has account"
    USERS ||--o| TEACHERS : "has account"
    USERS {
        bigint id PK
        string username UK
        string password
        enum role "ADMIN, TEACHER, STUDENT"
    }

    DEPARTMENTS ||--o{ STUDENTS : "enrolls"
    DEPARTMENTS ||--o{ TEACHERS : "employs"
    DEPARTMENTS ||--o{ COURSES : "offers"
    DEPARTMENTS {
        bigint id PK
        string name UK
    }

    STUDENTS ||--o{ ATTENDANCE : "has records"
    STUDENTS ||--o{ STUDENT_ELECTIVE_MAPPING : "chooses electives"
    STUDENTS {
        bigint id PK
        string roll_num UK
        string name
        string email UK
        bigint department_id FK
        int semester
        string section
        bigint user_id FK
    }

    TEACHERS ||--o{ TEACHER_COURSE_ALLOCATION : "teaches courses"
    TEACHERS ||--o{ MASTER_TIMETABLE : "scheduled in"
    TEACHERS ||--o{ CLASS_SESSIONS : "conducts classes"
    TEACHERS {
        bigint id PK
        string name
        string email UK
        bigint department_id FK
        bigint user_id FK
    }

    COURSES ||--o{ STUDENT_ELECTIVE_MAPPING : "offered as elective"
    COURSES ||--o{ TEACHER_COURSE_ALLOCATION : "allocated to teachers"
    COURSES ||--o{ MASTER_TIMETABLE : "in weekly schedule"
    COURSES ||--o{ CLASS_SESSIONS : "has sessions"
    COURSES {
        bigint id PK
        string name
        string code UK
        bigint department_id FK
        int semester
        enum type "CORE, ELECTIVE"
    }

    STUDENT_ELECTIVE_MAPPING {
        bigint id PK
        bigint student_id FK
        bigint course_id FK
    }

    TEACHER_COURSE_ALLOCATION {
        bigint id PK
        bigint teacher_id FK
        bigint course_id FK
        string section
    }

    MASTER_TIMETABLE {
        bigint id PK
        enum day_of_week "MONDAY-SUNDAY"
        int period
        bigint course_id FK
        bigint teacher_id FK
        string section
    }

    CLASS_SESSIONS ||--o{ ATTENDANCE : "tracks attendance"
    CLASS_SESSIONS {
        bigint id PK
        date date
        int period
        bigint course_id FK
        bigint teacher_id FK
        string section
        enum type "REGULAR, EXTRA, SUBSTITUTION"
        enum status "SCHEDULED, COMPLETED, CANCELLED"
    }

    ATTENDANCE {
        bigint id PK
        bigint student_id FK
        bigint session_id FK
        enum status "P, A, O, M"
        string remarks
    }
```

## Entity Descriptions

### Core Entities

1. **USERS**
   - Stores authentication credentials for all users
   - Role determines access level (Admin, Teacher, Student)

2. **DEPARTMENTS**
   - Academic departments (e.g., CSE, ECE)
   - Central entity linking students, teachers, and courses

3. **STUDENTS**
   - Student information and enrollment details
   - Links to User for authentication
   - Section determines class grouping

4. **TEACHERS**
   - Faculty information
   - Links to User for authentication

5. **COURSES**
   - Course catalog
   - Type distinguishes between CORE (mandatory) and ELECTIVE courses

### Relationship Entities

6. **STUDENT_ELECTIVE_MAPPING**
   - Many-to-Many: Students ↔ Elective Courses
   - Only used for elective courses (CORE courses are assigned by section)

7. **TEACHER_COURSE_ALLOCATION**
   - Many-to-Many: Teachers ↔ Courses
   - Tracks which teacher teaches which course to which section

### Schedule Entities

8. **MASTER_TIMETABLE**
   - Recurring weekly schedule
   - Defines the regular timetable (Day + Period + Course + Teacher + Section)

9. **CLASS_SESSIONS**
   - Actual class instances for specific dates
   - Generated from Master Timetable but can be modified
   - Supports EXTRA classes and SUBSTITUTIONS

### Tracking Entity

10. **ATTENDANCE**
    - Links students to class sessions
    - Status: P (Present), A (Absent), O (On Duty), M (Medical)

## Key Relationships

- **1:1** → User ↔ Student/Teacher (One user account per student/teacher)
- **1:N** → Department ↔ Students/Teachers/Courses
- **M:N** → Students ↔ Courses (via STUDENT_ELECTIVE_MAPPING for electives)
- **M:N** → Teachers ↔ Courses (via TEACHER_COURSE_ALLOCATION)
- **1:N** → Course ↔ Class Sessions (One course has many sessions)
- **1:N** → Class Session ↔ Attendance (One session has many attendance records)
