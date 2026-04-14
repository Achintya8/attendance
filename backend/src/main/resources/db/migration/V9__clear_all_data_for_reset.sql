-- Truncate all tables and reset identities
TRUNCATE TABLE 
    attendance,
    class_sessions,
    student_course_enrollments,
    student_elective_mappings,
    teacher_course_allocations,
    master_timetable,
    courses,
    students,
    teachers,
    departments,
    users
RESTART IDENTITY CASCADE;
