-- Seed Master Timetable for teacher 'chan@gmail.com' (Teacher ID will be fetched dynamically or assumed)
-- Assuming 'chan@gmail.com' is teacher with ID 9 (based on previous logs, but safer to use subquery)

INSERT INTO master_timetable (day_of_week, period, course_id, teacher_id, section)
SELECT 
    'MONDAY', 1, c.id, t.id, 'A'
FROM teachers t, courses c
WHERE t.email = 'chan@gmail.com' AND c.code = 'MCA113IA';

INSERT INTO master_timetable (day_of_week, period, course_id, teacher_id, section)
SELECT 
    'MONDAY', 2, c.id, t.id, 'B'
FROM teachers t, courses c
WHERE t.email = 'chan@gmail.com' AND c.code = 'MCA112IA';

INSERT INTO master_timetable (day_of_week, period, course_id, teacher_id, section)
SELECT 
    'TUESDAY', 1, c.id, t.id, 'A'
FROM teachers t, courses c
WHERE t.email = 'chan@gmail.com' AND c.code = 'MCA114A2';

INSERT INTO master_timetable (day_of_week, period, course_id, teacher_id, section)
SELECT 
    'WEDNESDAY', 3, c.id, t.id, 'A'
FROM teachers t, courses c
WHERE t.email = 'chan@gmail.com' AND c.code = 'MCA113IA';

INSERT INTO master_timetable (day_of_week, period, course_id, teacher_id, section)
SELECT 
    'THURSDAY', 4, c.id, t.id, 'B'
FROM teachers t, courses c
WHERE t.email = 'chan@gmail.com' AND c.code = 'MCA112IA';

INSERT INTO master_timetable (day_of_week, period, course_id, teacher_id, section)
SELECT 
    'FRIDAY', 2, c.id, t.id, 'A'
FROM teachers t, courses c
WHERE t.email = 'chan@gmail.com' AND c.code = 'MCA115A1';
