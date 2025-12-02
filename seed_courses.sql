-- Manual course seeding script
-- Run this if DataSeeder didn't create courses

-- Get department IDs first
DO $$
DECLARE
    mca_id BIGINT;
BEGIN
    SELECT id INTO mca_id FROM departments WHERE code = 'MCA';
    
    -- Insert courses if they don't exist
    INSERT INTO courses (name, code, department_id, semester, type)
    SELECT * FROM (VALUES
        ('Java Programming', 'MCA113IA', mca_id, 1, 'CORE'),
        ('Web Application Development', 'MCA112IA', mca_id, 1, 'CORE'),
        ('Computer Networks', 'MCA114A2', mca_id, 1, 'ELECTIVE'),
        ('Data Science', 'MCA115A1', mca_id, 1, 'ELECTIVE'),
        ('DevOps', 'MCA116A1', mca_id, 3, 'CORE'),
        ('Full Stack Development', 'MCA117A1', mca_id, 3, 'CORE'),
        ('AWS', 'MCA118A1', mca_id, 3, 'ELECTIVE'),
        ('Power BI', 'MCA119A1', mca_id, 3, 'ELECTIVE')
    ) AS v(name, code, department_id, semester, type)
    WHERE NOT EXISTS (
        SELECT 1 FROM courses WHERE code = v.code
    );
END $$;
