-- ==============================================================================
-- NIVORA AUTOMATIC SUBJECT SELECTION MIGRATION
-- ==============================================================================
-- This migration creates the normalized academic schema:
-- 1. universities
-- 2. colleges
-- 3. branches
-- 4. college_branches
-- 5. syllabus_versions
-- 6. subjects
-- And adds foreign keys (college_id, branch_id, regulation) to StudentProfile.
-- Includes RLS policies and high-performance RPC function get_student_subjects().
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. UNIVERSITIES TABLE
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_college_id TEXT,
  name TEXT NOT NULL,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  state TEXT,
  district TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_colleges_ext UNIQUE (external_college_id)
);

-- 3. BRANCHES TABLE
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  normalized_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. COLLEGE_BRANCHES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS college_branches (
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (college_id, branch_id)
);

-- 5. SYLLABUS_VERSIONS TABLE
CREATE TABLE IF NOT EXISTS syllabus_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  regulation TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_syllabus_versions UNIQUE (university_id, branch_id, regulation, academic_year)
);

-- 6. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syllabus_id UUID NOT NULL REFERENCES syllabus_versions(id) ON DELETE CASCADE,
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
  code TEXT,
  name TEXT NOT NULL,
  subject_type TEXT NOT NULL DEFAULT 'core'
    CHECK (subject_type IN ('core','lab','elective','open_elective','project','internship','skill','audit','induction')),
  credits NUMERIC(4,1) DEFAULT 0,
  lecture_hours NUMERIC(4,1) DEFAULT 0,
  tutorial_hours NUMERIC(4,1) DEFAULT 0,
  practical_hours NUMERIC(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_syllabus_sem_subject UNIQUE (syllabus_id, semester, name)
);

-- INDEXES FOR ULTRA-FAST QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_colleges_university ON colleges(university_id);
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(name);
CREATE INDEX IF NOT EXISTS idx_colleges_ext_id ON colleges(external_college_id);
CREATE INDEX IF NOT EXISTS idx_colleges_state_district ON colleges(state, district);
CREATE INDEX IF NOT EXISTS idx_branches_normalized ON branches(normalized_name);
CREATE INDEX IF NOT EXISTS idx_college_branches_branch ON college_branches(branch_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_lookup ON syllabus_versions(university_id, branch_id, regulation);
CREATE INDEX IF NOT EXISTS idx_subjects_syllabus_sem ON subjects(syllabus_id, semester);
CREATE INDEX IF NOT EXISTS idx_subjects_type ON subjects(subject_type);

-- STUDENT PROFILE INTEGRATION: Add college_id, branch_id, regulation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'StudentProfile') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'StudentProfile' AND column_name = 'college_id') THEN
      ALTER TABLE "StudentProfile" ADD COLUMN college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'StudentProfile' AND column_name = 'branch_id') THEN
      ALTER TABLE "StudentProfile" ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'StudentProfile' AND column_name = 'regulation') THEN
      ALTER TABLE "StudentProfile" ADD COLUMN regulation TEXT;
    END IF;
  END IF;
END $$;

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to academic catalogs so students can view and search them
DROP POLICY IF EXISTS "Public read universities" ON universities;
CREATE POLICY "Public read universities" ON universities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read colleges" ON colleges;
CREATE POLICY "Public read colleges" ON colleges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read branches" ON branches;
CREATE POLICY "Public read branches" ON branches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read college_branches" ON college_branches;
CREATE POLICY "Public read college_branches" ON college_branches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read syllabus_versions" ON syllabus_versions;
CREATE POLICY "Public read syllabus_versions" ON syllabus_versions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read subjects" ON subjects;
CREATE POLICY "Public read subjects" ON subjects FOR SELECT USING (true);

-- No INSERT/UPDATE/DELETE policies for anon/authenticated roles. Only service_role can modify academic catalog!

-- ==============================================================================
-- RPC FUNCTION: get_student_subjects(p_student_id, p_semester)
-- Internally resolves:
-- student -> college -> university -> branch -> syllabus_version -> semester -> subjects
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_student_subjects(
  p_student_id TEXT,
  p_semester INT DEFAULT NULL
)
RETURNS TABLE (
  subject_id UUID,
  syllabus_id UUID,
  semester INT,
  code TEXT,
  name TEXT,
  subject_type TEXT,
  credits NUMERIC,
  lecture_hours NUMERIC,
  tutorial_hours NUMERIC,
  practical_hours NUMERIC,
  regulation TEXT,
  academic_year TEXT,
  university_id UUID,
  university_name TEXT,
  college_id UUID,
  college_name TEXT,
  branch_id UUID,
  branch_name TEXT
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE
  v_college_id UUID;
  v_branch_id UUID;
  v_regulation TEXT;
  v_semester INT;
  v_university_id UUID;
  v_syllabus_id UUID;
  v_college_name TEXT;
  v_branch_name TEXT;
  v_college_text TEXT;
  v_stream_text TEXT;
BEGIN
  -- 1. Fetch student's academic profile
  SELECT 
    sp.college_id,
    sp.branch_id,
    sp.regulation,
    COALESCE(p_semester, sp.semester, 1),
    sp.college,
    sp.stream
  INTO 
    v_college_id,
    v_branch_id,
    v_regulation,
    v_semester,
    v_college_text,
    v_stream_text
  FROM "StudentProfile" sp
  WHERE sp."userId" = p_student_id OR sp.id = p_student_id
  LIMIT 1;

  -- Fallback if IDs were not stored yet but college/stream names were
  IF v_college_id IS NULL AND v_college_text IS NOT NULL THEN
    SELECT c.id, c.university_id INTO v_college_id, v_university_id
    FROM colleges c
    WHERE c.name ILIKE '%' || TRIM(v_college_text) || '%'
    LIMIT 1;
  END IF;

  IF v_branch_id IS NULL AND v_stream_text IS NOT NULL THEN
    SELECT b.id INTO v_branch_id
    FROM branches b
    WHERE b.name ILIKE '%' || TRIM(v_stream_text) || '%'
       OR b.normalized_name ILIKE '%' || TRIM(v_stream_text) || '%'
    LIMIT 1;
  END IF;

  -- If still null, return empty result
  IF v_college_id IS NULL OR v_branch_id IS NULL THEN
    RETURN;
  END IF;

  -- 2. Resolve university_id from college
  IF v_university_id IS NULL THEN
    SELECT c.university_id, c.name INTO v_university_id, v_college_name
    FROM colleges c
    WHERE c.id = v_college_id;
  ELSE
    SELECT c.name INTO v_college_name
    FROM colleges c
    WHERE c.id = v_college_id;
  END IF;

  IF v_university_id IS NULL THEN
    RETURN;
  END IF;

  -- 3. Resolve matching syllabus_version
  -- First preference: exact regulation (e.g. 'R25')
  IF v_regulation IS NOT NULL AND TRIM(v_regulation) <> '' THEN
    SELECT sv.id INTO v_syllabus_id
    FROM syllabus_versions sv
    WHERE sv.university_id = v_university_id
      AND sv.branch_id = v_branch_id
      AND sv.regulation ILIKE TRIM(v_regulation)
    ORDER BY sv.academic_year DESC
    LIMIT 1;
  END IF;

  -- Second preference: latest syllabus version for this university + branch
  IF v_syllabus_id IS NULL THEN
    SELECT sv.id INTO v_syllabus_id
    FROM syllabus_versions sv
    WHERE sv.university_id = v_university_id
      AND sv.branch_id = v_branch_id
    ORDER BY sv.academic_year DESC, sv.regulation DESC
    LIMIT 1;
  END IF;

  -- If no syllabus found, return empty
  IF v_syllabus_id IS NULL THEN
    RETURN;
  END IF;

  -- 4. Automatically Fetch matching subjects from subjects table
  RETURN QUERY
  SELECT 
    s.id AS subject_id,
    s.syllabus_id,
    s.semester,
    s.code,
    s.name,
    s.subject_type,
    s.credits,
    s.lecture_hours,
    s.tutorial_hours,
    s.practical_hours,
    sv.regulation,
    sv.academic_year,
    u.id AS university_id,
    u.name AS university_name,
    v_college_id AS college_id,
    v_college_name AS college_name,
    b.id AS branch_id,
    b.name AS branch_name
  FROM subjects s
  JOIN syllabus_versions sv ON s.syllabus_id = sv.id
  JOIN universities u ON sv.university_id = u.id
  JOIN branches b ON sv.branch_id = b.id
  WHERE s.syllabus_id = v_syllabus_id
    AND s.semester = v_semester
  ORDER BY 
    CASE 
      WHEN s.subject_type = 'core' THEN 1
      WHEN s.subject_type = 'lab' THEN 2
      WHEN s.subject_type = 'elective' THEN 3
      WHEN s.subject_type = 'skill' THEN 4
      WHEN s.subject_type = 'project' THEN 5
      ELSE 6 
    END,
    s.code NULLS LAST,
    s.name ASC;
END;
$$;

-- ==============================================================================
-- RPC FUNCTION: get_subjects_by_academic_selection
-- Allows auto-fetching subjects before saving or in real-time UI preview
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_subjects_by_academic_selection(
  p_college_id UUID,
  p_branch_id UUID,
  p_regulation TEXT DEFAULT NULL,
  p_semester INT DEFAULT 1
)
RETURNS TABLE (
  subject_id UUID,
  syllabus_id UUID,
  semester INT,
  code TEXT,
  name TEXT,
  subject_type TEXT,
  credits NUMERIC,
  lecture_hours NUMERIC,
  tutorial_hours NUMERIC,
  practical_hours NUMERIC,
  regulation TEXT,
  academic_year TEXT,
  university_id UUID,
  university_name TEXT,
  college_id UUID,
  college_name TEXT,
  branch_id UUID,
  branch_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_university_id UUID;
  v_syllabus_id UUID;
  v_college_name TEXT;
BEGIN
  -- Resolve university from college
  SELECT c.university_id, c.name INTO v_university_id, v_college_name
  FROM colleges c
  WHERE c.id = p_college_id;

  IF v_university_id IS NULL THEN
    RETURN;
  END IF;

  -- Resolve syllabus version
  IF p_regulation IS NOT NULL AND TRIM(p_regulation) <> '' THEN
    SELECT sv.id INTO v_syllabus_id
    FROM syllabus_versions sv
    WHERE sv.university_id = v_university_id
      AND sv.branch_id = p_branch_id
      AND sv.regulation ILIKE TRIM(p_regulation)
    ORDER BY sv.academic_year DESC
    LIMIT 1;
  END IF;

  IF v_syllabus_id IS NULL THEN
    SELECT sv.id INTO v_syllabus_id
    FROM syllabus_versions sv
    WHERE sv.university_id = v_university_id
      AND sv.branch_id = p_branch_id
    ORDER BY sv.academic_year DESC, sv.regulation DESC
    LIMIT 1;
  END IF;

  IF v_syllabus_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    s.id AS subject_id,
    s.syllabus_id,
    s.semester,
    s.code,
    s.name,
    s.subject_type,
    s.credits,
    s.lecture_hours,
    s.tutorial_hours,
    s.practical_hours,
    sv.regulation,
    sv.academic_year,
    u.id AS university_id,
    u.name AS university_name,
    p_college_id AS college_id,
    v_college_name AS college_name,
    b.id AS branch_id,
    b.name AS branch_name
  FROM subjects s
  JOIN syllabus_versions sv ON s.syllabus_id = sv.id
  JOIN universities u ON sv.university_id = u.id
  JOIN branches b ON sv.branch_id = b.id
  WHERE s.syllabus_id = v_syllabus_id
    AND s.semester = p_semester
  ORDER BY 
    CASE 
      WHEN s.subject_type = 'core' THEN 1
      WHEN s.subject_type = 'lab' THEN 2
      WHEN s.subject_type = 'elective' THEN 3
      WHEN s.subject_type = 'skill' THEN 4
      WHEN s.subject_type = 'project' THEN 5
      ELSE 6 
    END,
    s.code NULLS LAST,
    s.name ASC;
END;
$$;
