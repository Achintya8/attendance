-- Seed courses for MCA department
-- This migration adds the 8 core courses needed for the attendance system

INSERT INTO courses (name, code, department_id, semester, type)
SELECT 
    v.name, 
    v.code, 
    d.id, 
    v.semester, 
    v.type
FROM (VALUES
    ('Java Programming', 'MCA113IA', 1, 'CORE'),
    ('Web Application Development', 'MCA112IA', 1, 'CORE'),
    ('Computer Networks', 'MCA114A2', 1, 'ELECTIVE'),
    ('Data Science', 'MCA115A1', 1, 'ELECTIVE'),
    ('DevOps', 'MCA116A1', 3, 'CORE'),
    ('Full Stack Development', 'MCA117A1', 3, 'CORE'),
    ('AWS', 'MCA118A1', 3, 'ELECTIVE'),
    ('Power BI', 'MCA119A1', 3, 'ELECTIVE')
) AS v(name, code, semester, type)
CROSS JOIN departments d
WHERE d.code = 'MCA'
  AND NOT EXISTS (
      SELECT 1 FROM courses WHERE code = v.code
  );
