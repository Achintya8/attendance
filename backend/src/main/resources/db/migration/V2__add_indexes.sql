
CREATE INDEX idx_students_department_id ON students(department_id);
CREATE INDEX idx_students_section ON students(section);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_session_id ON attendance(session_id);
CREATE INDEX idx_class_sessions_date ON class_sessions(date);
CREATE INDEX idx_class_sessions_teacher_id ON class_sessions(teacher_id);
