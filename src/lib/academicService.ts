import prisma from '@/lib/prisma';

export interface AcademicSubjectResult {
  id: string;
  syllabusId: string;
  semester: number;
  code: string;
  name: string;
  subjectType: string;
  credits: number;
  lectureHours: number;
  tutorialHours: number;
  practicalHours: number;
  regulation?: string;
  academicYear?: string;
  universityId?: string;
  universityName?: string;
  collegeId?: string;
  collegeName?: string;
  branchId?: string;
  branchName?: string;
}

export interface AcademicSelectionResponse {
  available: boolean;
  message?: string;
  subjects: AcademicSubjectResult[];
  totalCredits: number;
  coreCount: number;
  labCount: number;
  electiveCount: number;
  skillCount: number;
  auditCount: number;
  projectCount: number;
  universityName?: string;
  collegeName?: string;
  branchName?: string;
  regulation?: string;
  academicYear?: string;
  semester: number;
}

// In-memory Cache with TTL (10 minutes)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const memoryCache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setToCache<T>(key: string, data: T): void {
  // Simple eviction if cache exceeds 1,000 entries
  if (memoryCache.size > 1000) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Searches real colleges from database with university affiliation
 */
export async function searchColleges(query = '', limit = 30) {
  const cacheKey = `colleges_q_${query.toLowerCase().trim()}_l_${limit}`;
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) return cached;

  const trimmed = query.trim();

  let colleges: any[] = [];

  if (!trimmed) {
    // Return prominent colleges
    colleges = await prisma.$queryRawUnsafe(`
      SELECT 
        c.id, 
        c.external_college_id AS "externalCollegeId", 
        c.name, 
        c.state, 
        c.district, 
        c.website,
        u.id AS "universityId",
        u.name AS "universityName"
      FROM colleges c
      JOIN universities u ON c.university_id = u.id
      ORDER BY 
        CASE WHEN u.name ILIKE '%Hyderabad%' THEN 0 ELSE 1 END,
        c.name ASC
      LIMIT ${Math.min(100, Math.max(1, limit))};
    `);
  } else {
    // Search by college name, district, state, or external ID
    colleges = await prisma.$queryRawUnsafe(`
      SELECT 
        c.id, 
        c.external_college_id AS "externalCollegeId", 
        c.name, 
        c.state, 
        c.district, 
        c.website,
        u.id AS "universityId",
        u.name AS "universityName"
      FROM colleges c
      JOIN universities u ON c.university_id = u.id
      WHERE c.name ILIKE $1 
         OR c.district ILIKE $1 
         OR c.state ILIKE $1 
         OR c.external_college_id ILIKE $1
         OR u.name ILIKE $1
      ORDER BY 
        CASE WHEN c.name ILIKE $2 THEN 0 ELSE 1 END,
        CASE WHEN u.name ILIKE '%Hyderabad%' THEN 0 ELSE 1 END,
        c.name ASC
      LIMIT ${Math.min(100, Math.max(1, limit))};
    `, `%${trimmed}%`, `${trimmed}%`);
  }

  setToCache(cacheKey, colleges);
  return colleges;
}

/**
 * Retrieves college by ID including university details
 */
export async function getCollegeById(collegeId: string) {
  const cacheKey = `college_id_${collegeId}`;
  const cached = getFromCache<any>(cacheKey);
  if (cached) return cached;

  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      c.id, 
      c.external_college_id AS "externalCollegeId", 
      c.name, 
      c.state, 
      c.district, 
      c.website,
      u.id AS "universityId",
      u.name AS "universityName"
    FROM colleges c
    JOIN universities u ON c.university_id = u.id
    WHERE c.id = '${collegeId}'::uuid
    LIMIT 1;
  `);

  const result = rows[0] || null;
  if (result) setToCache(cacheKey, result);
  return result;
}

/**
 * Gets the branches offered by a specific college
 */
export async function getCollegeBranches(collegeId: string) {
  const cacheKey = `branches_col_${collegeId}`;
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) return cached;

  const branches: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      b.id, 
      b.name, 
      b.normalized_name AS "normalizedName"
    FROM college_branches cb
    JOIN branches b ON cb.branch_id = b.id
    WHERE cb.college_id = '${collegeId}'::uuid
    ORDER BY 
      CASE WHEN b.name ILIKE '%Computer Science%' THEN 0 ELSE 1 END,
      b.name ASC;
  `);

  setToCache(cacheKey, branches);
  return branches;
}

/**
 * Gets available regulations and academic years for a university & branch
 */
export async function getRegulations(universityId: string, branchId: string) {
  const cacheKey = `regulations_${universityId}_${branchId}`;
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) return cached;

  const regulations: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      sv.id AS "syllabusId",
      sv.regulation,
      sv.academic_year AS "academicYear",
      sv.source_url AS "sourceUrl"
    FROM syllabus_versions sv
    WHERE sv.university_id = '${universityId}'::uuid
      AND sv.branch_id = '${branchId}'::uuid
    ORDER BY sv.academic_year DESC, sv.regulation DESC;
  `);

  setToCache(cacheKey, regulations);
  return regulations;
}

/**
 * Automatically fetches subjects for an academic selection using the database RPC
 */
export async function getSubjectsBySelection(
  collegeId: string,
  branchId: string,
  regulation = 'R25',
  semester = 1
): Promise<AcademicSelectionResponse> {
  const cacheKey = `sub_sel_${collegeId}_${branchId}_${regulation}_${semester}`;
  const cached = getFromCache<AcademicSelectionResponse>(cacheKey);
  if (cached) return cached;

  const cleanReg = (regulation || 'R25').trim();
  const semNum = Math.max(1, Math.min(8, parseInt(String(semester), 10) || 1));

  try {
    const rawRows: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM get_subjects_by_academic_selection(
        '${collegeId}'::uuid,
        '${branchId}'::uuid,
        ${cleanReg ? `'${cleanReg}'` : 'NULL'},
        ${semNum}
      );
    `);

    if (!rawRows || rawRows.length === 0) {
      // Fetch metadata to provide a contextual empty state
      const college = await getCollegeById(collegeId);
      const res: AcademicSelectionResponse = {
        available: false,
        message: 'Your syllabus is not available yet. Please select another regulation or contact support.',
        subjects: [],
        totalCredits: 0,
        coreCount: 0,
        labCount: 0,
        electiveCount: 0,
        skillCount: 0,
        auditCount: 0,
        projectCount: 0,
        collegeName: college?.name,
        universityName: college?.universityName,
        semester: semNum,
        regulation: cleanReg,
      };
      setToCache(cacheKey, res);
      return res;
    }

    const subjects: AcademicSubjectResult[] = rawRows.map((r: any) => ({
      id: r.subject_id,
      syllabusId: r.syllabus_id,
      semester: r.semester,
      code: r.code || '',
      name: r.name,
      subjectType: r.subject_type,
      credits: Number(r.credits) || 0,
      lectureHours: Number(r.lecture_hours) || 0,
      tutorialHours: Number(r.tutorial_hours) || 0,
      practicalHours: Number(r.practical_hours) || 0,
      regulation: r.regulation,
      academicYear: r.academic_year,
      universityId: r.university_id,
      universityName: r.university_name,
      collegeId: r.college_id,
      collegeName: r.college_name,
      branchId: r.branch_id,
      branchName: r.branch_name,
    }));

    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const coreCount = subjects.filter((s) => s.subjectType === 'core').length;
    const labCount = subjects.filter((s) => s.subjectType === 'lab').length;
    const electiveCount = subjects.filter((s) => s.subjectType === 'elective' || s.subjectType === 'open_elective').length;
    const skillCount = subjects.filter((s) => s.subjectType === 'skill').length;
    const auditCount = subjects.filter((s) => s.subjectType === 'audit').length;
    const projectCount = subjects.filter((s) => s.subjectType === 'project' || s.subjectType === 'internship').length;

    const first = subjects[0];
    const response: AcademicSelectionResponse = {
      available: true,
      subjects,
      totalCredits,
      coreCount,
      labCount,
      electiveCount,
      skillCount,
      auditCount,
      projectCount,
      universityName: first?.universityName,
      collegeName: first?.collegeName,
      branchName: first?.branchName,
      regulation: first?.regulation || cleanReg,
      academicYear: first?.academicYear,
      semester: semNum,
    };

    setToCache(cacheKey, response);
    return response;
  } catch (err) {
    console.error('getSubjectsBySelection RPC error:', err);
    return {
      available: false,
      message: 'Your syllabus is not available yet. Please select another regulation or contact support.',
      subjects: [],
      totalCredits: 0,
      coreCount: 0,
      labCount: 0,
      electiveCount: 0,
      skillCount: 0,
      auditCount: 0,
      projectCount: 0,
      semester: semNum,
      regulation: cleanReg,
    };
  }
}

/**
 * Automatically fetches the subjects for an authenticated student using get_student_subjects RPC
 */
export async function getStudentSubjects(
  studentId: string,
  semester?: number
): Promise<AcademicSelectionResponse> {
  const cacheKey = `student_subs_${studentId}_sem_${semester || 'default'}`;
  const cached = getFromCache<AcademicSelectionResponse>(cacheKey);
  if (cached) return cached;

  try {
    const semArg = semester ? `${Math.max(1, Math.min(8, semester))}` : 'NULL';
    const rawRows: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM get_student_subjects('${studentId}', ${semArg});
    `);

    if (!rawRows || rawRows.length === 0) {
      return {
        available: false,
        message: 'Your syllabus is not available yet. Please select another regulation or contact support.',
        subjects: [],
        totalCredits: 0,
        coreCount: 0,
        labCount: 0,
        electiveCount: 0,
        skillCount: 0,
        auditCount: 0,
        projectCount: 0,
        semester: semester || 1,
      };
    }

    const subjects: AcademicSubjectResult[] = rawRows.map((r: any) => ({
      id: r.subject_id,
      syllabusId: r.syllabus_id,
      semester: r.semester,
      code: r.code || '',
      name: r.name,
      subjectType: r.subject_type,
      credits: Number(r.credits) || 0,
      lectureHours: Number(r.lecture_hours) || 0,
      tutorialHours: Number(r.tutorial_hours) || 0,
      practicalHours: Number(r.practical_hours) || 0,
      regulation: r.regulation,
      academicYear: r.academic_year,
      universityId: r.university_id,
      universityName: r.university_name,
      collegeId: r.college_id,
      collegeName: r.college_name,
      branchId: r.branch_id,
      branchName: r.branch_name,
    }));

    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const coreCount = subjects.filter((s) => s.subjectType === 'core').length;
    const labCount = subjects.filter((s) => s.subjectType === 'lab').length;
    const electiveCount = subjects.filter((s) => s.subjectType === 'elective' || s.subjectType === 'open_elective').length;
    const skillCount = subjects.filter((s) => s.subjectType === 'skill').length;
    const auditCount = subjects.filter((s) => s.subjectType === 'audit').length;
    const projectCount = subjects.filter((s) => s.subjectType === 'project' || s.subjectType === 'internship').length;

    const first = subjects[0];
    const response: AcademicSelectionResponse = {
      available: true,
      subjects,
      totalCredits,
      coreCount,
      labCount,
      electiveCount,
      skillCount,
      auditCount,
      projectCount,
      universityName: first?.universityName,
      collegeName: first?.collegeName,
      branchName: first?.branchName,
      regulation: first?.regulation,
      academicYear: first?.academicYear,
      semester: first?.semester || semester || 1,
    };

    setToCache(cacheKey, response);
    return response;
  } catch (err) {
    console.error('getStudentSubjects RPC error:', err);
    return {
      available: false,
      message: 'Your syllabus is not available yet. Please select another regulation or contact support.',
      subjects: [],
      totalCredits: 0,
      coreCount: 0,
      labCount: 0,
      electiveCount: 0,
      skillCount: 0,
      auditCount: 0,
      projectCount: 0,
      semester: semester || 1,
    };
  }
}
