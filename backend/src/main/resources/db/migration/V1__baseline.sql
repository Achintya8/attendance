
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    semester INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    department_id BIGINT REFERENCES departments(id)
);

CREATE TABLE teachers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department_id BIGINT REFERENCES departments(id),
    user_id BIGINT REFERENCES users(id)
);

CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    roll_num VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    semester INTEGER NOT NULL,
    section VARCHAR(10),
    admission_year INTEGER,
    current_batch VARCHAR(50),
    department_id BIGINT REFERENCES departments(id),
    user_id BIGINT REFERENCES users(id)
);

CREATE TABLE master_timetable (
    id BIGSERIAL PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL,
    period INTEGER NOT NULL,
    section VARCHAR(10) NOT NULL,
    course_id BIGINT REFERENCES courses(id),
    teacher_id BIGINT REFERENCES teachers(id)
);

CREATE TABLE class_sessions (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    period INTEGER NOT NULL,
    section VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    course_id BIGINT REFERENCES courses(id),
    teacher_id BIGINT REFERENCES teachers(id)
);

CREATE TABLE attendance (
    id BIGSERIAL PRIMARY KEY,
    status VARCHAR(10) NOT NULL,
    remarks VARCHAR(255),
    student_id BIGINT REFERENCES students(id),
    session_id BIGINT REFERENCES class_sessions(id)
);

CREATE TABLE student_course_enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id),
    course_id BIGINT REFERENCES courses(id),
    enrolled_at TIMESTAMP,
    UNIQUE(student_id, course_id)
);

CREATE TABLE student_elective_mappings (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id),
    course_id BIGINT REFERENCES courses(id)
);

CREATE TABLE teacher_course_allocations (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT REFERENCES teachers(id),
    course_id BIGINT REFERENCES courses(id),
    section VARCHAR(10) NOT NULL
);
