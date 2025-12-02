DELETE FROM attendance;
DELETE FROM student_course_enrollments;
DELETE FROM students;
DELETE FROM users WHERE role = 'STUDENT';
