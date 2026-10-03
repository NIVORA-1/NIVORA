import prisma from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

interface CollegeData {
  external_college_id: string;
  name: string;
  university_name: string;
  state: string;
  district: string;
  website: string;
}

interface BranchData {
  name: string;
  normalized_name: string;
}

interface CollegeBranchData {
  external_college_id: string;
  branch_name: string;
}

interface CatalogData {
  universities: string[];
  branches: BranchData[];
  colleges: CollegeData[];
  college_branches: CollegeBranchData[];
}

function escapeSql(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

async function seedCatalog() {
  console.log('--- STARTING ACADEMIC CATALOG SEED ---');
  const jsonPath = path.join(__dirname, '../src/data/engineering_colleges_database.json');
  const catalog: CatalogData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Ensure JNTUH is present with standard name
  const jntuhStandardName = 'Jawaharlal Nehru Technological University, Hyderabad';
  const jntuhAltName = 'Jawaharlal Nehru Technological University Hyderabad';
  if (!catalog.universities.includes(jntuhStandardName)) {
    catalog.universities.push(jntuhStandardName);
  }
  if (!catalog.universities.includes(jntuhAltName)) {
    catalog.universities.push(jntuhAltName);
  }

  // 1. Seed Universities
  console.log(`Seeding ${catalog.universities.length} universities...`);
  const uniValues = catalog.universities.map((u) => `(${escapeSql(u)})`).join(',\n');
  await prisma.$executeRawUnsafe(`
    INSERT INTO universities (name)
    VALUES ${uniValues}
    ON CONFLICT (name) DO NOTHING;
  `);

  // Query universities into a memory map
  const uniRows: { id: string; name: string }[] = await prisma.$queryRawUnsafe(`
    SELECT id, name FROM universities;
  `);
  const uniMap = new Map<string, string>();
  for (const u of uniRows) {
    uniMap.set(u.name.toLowerCase().trim(), u.id);
  }

  // JNTUH primary ID
  const jntuhId = uniMap.get(jntuhStandardName.toLowerCase()) || uniMap.get(jntuhAltName.toLowerCase());
  console.log(`Universities seeded. JNTUH ID: ${jntuhId}`);

  // 2. Seed Branches
  // Ensure "Computer Science & Engineering" and "Computer Science and Engineering" exist
  const additionalBranches = [
    { name: 'Computer Science & Engineering', normalized_name: 'cse' },
    { name: 'Computer Science and Engineering', normalized_name: 'cse' },
    { name: 'Information Technology', normalized_name: 'it' },
    { name: 'Electronics & Communication Engineering', normalized_name: 'ece' },
    { name: 'Electrical & Electronics Engineering', normalized_name: 'eee' },
    { name: 'Mechanical Engineering', normalized_name: 'mech' },
    { name: 'Civil Engineering', normalized_name: 'civil' },
  ];

  for (const ab of additionalBranches) {
    if (!catalog.branches.some((b) => b.name.toLowerCase() === ab.name.toLowerCase())) {
      catalog.branches.push(ab);
    }
  }

  console.log(`Seeding ${catalog.branches.length} branches...`);
  const branchValues = catalog.branches
    .map((b) => `(${escapeSql(b.name)}, ${escapeSql(b.normalized_name)})`)
    .join(',\n');
  await prisma.$executeRawUnsafe(`
    INSERT INTO branches (name, normalized_name)
    VALUES ${branchValues}
    ON CONFLICT (name) DO UPDATE SET normalized_name = EXCLUDED.normalized_name;
  `);

  const branchRows: { id: string; name: string; normalized_name: string }[] = await prisma.$queryRawUnsafe(`
    SELECT id, name, normalized_name FROM branches;
  `);
  const branchMap = new Map<string, string>();
  for (const b of branchRows) {
    branchMap.set(b.name.toLowerCase().trim(), b.id);
    branchMap.set(b.normalized_name.toLowerCase().trim(), b.id);
  }

  // 3. Seed Colleges
  console.log(`Seeding ${catalog.colleges.length} colleges...`);
  const BATCH_SIZE = 100;
  for (let i = 0; i < catalog.colleges.length; i += BATCH_SIZE) {
    const batch = catalog.colleges.slice(i, i + BATCH_SIZE);
    const collegeValueRows = batch
      .map((c) => {
        let uId = uniMap.get(c.university_name.toLowerCase().trim());
        if (!uId && c.university_name.includes('Hyderabad')) {
          uId = jntuhId;
        }
        if (!uId) {
          // fallback to first university or insert
          uId = uniRows[0]?.id;
        }
        return `(${escapeSql(c.external_college_id)}, ${escapeSql(c.name)}, '${uId}'::uuid, ${escapeSql(c.state)}, ${escapeSql(c.district)}, ${escapeSql(c.website)})`;
      })
      .join(',\n');

    await prisma.$executeRawUnsafe(`
      INSERT INTO colleges (external_college_id, name, university_id, state, district, website)
      VALUES ${collegeValueRows}
      ON CONFLICT (external_college_id) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        university_id = EXCLUDED.university_id,
        state = EXCLUDED.state,
        district = EXCLUDED.district,
        website = EXCLUDED.website;
    `);
  }

  const collegeRows: { id: string; external_college_id: string }[] = await prisma.$queryRawUnsafe(`
    SELECT id, external_college_id FROM colleges;
  `);
  const collegeMap = new Map<string, string>();
  for (const c of collegeRows) {
    collegeMap.set(c.external_college_id, c.id);
  }
  console.log(`Total colleges saved in DB: ${collegeMap.size}`);

  // 4. Seed College Branches junction
  console.log(`Seeding ${catalog.college_branches.length} college-branch mappings...`);
  const validCollegeBranches: { college_id: string; branch_id: string }[] = [];
  for (const cb of catalog.college_branches) {
    const cId = collegeMap.get(cb.external_college_id);
    const bId = branchMap.get(cb.branch_name.toLowerCase().trim());
    if (cId && bId) {
      validCollegeBranches.push({ college_id: cId, branch_id: bId });
    }
  }

  // Deduplicate
  const uniqueCbSet = new Set<string>();
  const dedupedCb: { college_id: string; branch_id: string }[] = [];
  for (const item of validCollegeBranches) {
    const key = `${item.college_id}_${item.branch_id}`;
    if (!uniqueCbSet.has(key)) {
      uniqueCbSet.add(key);
      dedupedCb.push(item);
    }
  }

  for (let i = 0; i < dedupedCb.length; i += 200) {
    const batch = dedupedCb.slice(i, i + 200);
    const values = batch
      .map((item) => `('${item.college_id}'::uuid, '${item.branch_id}'::uuid)`)
      .join(',\n');

    await prisma.$executeRawUnsafe(`
      INSERT INTO college_branches (college_id, branch_id)
      VALUES ${values}
      ON CONFLICT (college_id, branch_id) DO NOTHING;
    `);
  }
  console.log(`Successfully seeded ${dedupedCb.length} college-branch links!`);

  // 5. Seed JNTUH CSE Syllabus Version & Subjects (Verified from nivora_subject_database.sql)
  console.log('Seeding verified JNTUH CSE R25 2025-2026 syllabus and subjects...');
  
  // Find JNTUH and CSE branch IDs
  const cseBranchId = branchMap.get('computer science & engineering') || branchMap.get('computer science and engineering') || branchMap.get('cse');
  
  if (!jntuhId || !cseBranchId) {
    throw new Error(`Could not find JNTUH ID (${jntuhId}) or CSE Branch ID (${cseBranchId})`);
  }

  // Also make sure both variations of JNTUH name and CSE branch name have syllabus version
  const jntuhNames = [jntuhStandardName, jntuhAltName];
  const cseBranchNames = ['Computer Science & Engineering', 'Computer Science and Engineering'];

  for (const uName of jntuhNames) {
    const uId = uniMap.get(uName.toLowerCase().trim());
    if (!uId) continue;

    for (const bName of cseBranchNames) {
      const bId = branchMap.get(bName.toLowerCase().trim());
      if (!bId) continue;

      // Upsert syllabus_version
      await prisma.$executeRawUnsafe(`
        INSERT INTO syllabus_versions (university_id, branch_id, regulation, academic_year, source_url)
        VALUES (
          '${uId}'::uuid, 
          '${bId}'::uuid, 
          'R25', 
          '2025-2026', 
          'https://jntuh.ac.in/uploads/academics/R25B.TECH.CSECourseStructure.pdf'
        )
        ON CONFLICT (university_id, branch_id, regulation, academic_year) DO NOTHING;
      `);

      // Retrieve syllabus_version ID
      const svRows: { id: string }[] = await prisma.$queryRawUnsafe(`
        SELECT id FROM syllabus_versions 
        WHERE university_id = '${uId}'::uuid 
          AND branch_id = '${bId}'::uuid 
          AND regulation = 'R25' 
          AND academic_year = '2025-2026'
        LIMIT 1;
      `);

      if (svRows.length === 0) continue;
      const syllabusId = svRows[0].id;

      // Seed all Semesters 1-8 verified subjects
      const subjectsData = [
        // Semester 1
        { sem: 1, code: 'MA101BS', name: 'Matrices and Calculus', type: 'core', credits: 4, l: 3, t: 1, p: 0 },
        { sem: 1, code: 'CH102BS', name: 'Engineering Chemistry', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 1, code: 'EN103HS', name: 'English for Skill Enhancement', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 1, code: 'EC104ES', name: 'Electronic Devices and Circuits', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 1, code: 'CS105ES', name: 'Programming for Problem Solving', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 1, code: 'CH106BS', name: 'Engineering Chemistry Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 1, code: 'CS107ES', name: 'Programming for Problem Solving Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 1, code: 'EN108HS', name: 'English Language and Communication Skills Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 1, code: 'ME109ES', name: 'Engineering Workshop', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },

        // Semester 2
        { sem: 2, code: 'MA201BS', name: 'Ordinary Differential Equations and Vector Calculus', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 2, code: 'PH202BS', name: 'Advanced Engineering Physics', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 2, code: 'ME203ES', name: 'Computer Aided Engineering Graphics', type: 'core', credits: 3, l: 2, t: 0, p: 2 },
        { sem: 2, code: 'EE204ES', name: 'Basic Electrical Engineering', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 2, code: 'CS205ES', name: 'Data Structures', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 2, code: 'PH206BS', name: 'Advanced Engineering Physics Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 2, code: 'CS207ES', name: 'Data Structures Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 2, code: 'CS208ES', name: 'Python Programming Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 2, code: 'EE209ES', name: 'Basic Electrical Engineering Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 2, code: 'CS210ES', name: 'IT Workshop', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },

        // Semester 3
        { sem: 3, code: 'CS301PC', name: 'Discrete Mathematics', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 3, code: 'CS302PC', name: 'Computer Organization and Architecture', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 3, code: 'CS303PC', name: 'Object Oriented Programming through Java', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 3, code: 'CS304PC', name: 'Software Engineering', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 3, code: 'CS305PC', name: 'Data Base Management Systems', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 3, code: 'MB306HS', name: 'Innovation and Entrepreneurship', type: 'core', credits: 2, l: 2, t: 0, p: 0 },
        { sem: 3, code: 'CS307PC', name: 'Object Oriented Programming through Java Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 3, code: 'CS308PC', name: 'Software Engineering Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 3, code: 'CS309PC', name: 'Data Base Management Systems Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 3, code: 'CS310SC', name: 'Node Js/React JS/Django', type: 'skill', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 3, code: 'MC311', name: 'Environmental Science', type: 'audit', credits: 0, l: 1, t: 0, p: 0 },

        // Semester 4
        { sem: 4, code: 'MA401BS', name: 'Computer Oriented Statistical Methods', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 4, code: 'CS402PC', name: 'Operating Systems', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 4, code: 'CS403PC', name: 'Algorithm Design and Analysis', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 4, code: 'CS404PC', name: 'Computer Networks', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 4, code: 'CS405PC', name: 'Machine Learning', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 4, code: 'MA406BS', name: 'Computational Mathematics Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 4, code: 'CS407PC', name: 'Operating Systems Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 4, code: 'CS408PC', name: 'Computer Networks Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 4, code: 'CS409PC', name: 'Machine Learning Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 4, code: 'CS410SC', name: 'Data Visualization- R/Python/Power BI', type: 'skill', credits: 1, l: 0, t: 0, p: 2 },

        // Semester 5
        { sem: 5, code: 'CS501PC', name: 'Automata Theory and Compiler Design', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 5, code: 'CS502PC', name: 'Artificial Intelligence', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 5, code: 'CS503PC', name: 'DevOps', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 5, code: 'CS511PE', name: 'Professional Elective-I', type: 'elective', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 5, code: 'OE501', name: 'Open Elective-I', type: 'open_elective', credits: 2, l: 2, t: 0, p: 0 },
        { sem: 5, code: 'CS504PC', name: 'Compiler Design Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 5, code: 'CS505PC', name: 'Artificial Intelligence with Python Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 5, code: 'CS506PC', name: 'DevOps Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 5, code: 'CS507PR', name: 'Field-Based Project/Internship', type: 'internship', credits: 2, l: 0, t: 0, p: 4 },
        { sem: 5, code: 'CS508SC', name: 'UI Design – Flutter/Android Studio', type: 'skill', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 5, code: 'MC509', name: 'Indian Knowledge System', type: 'audit', credits: 0, l: 1, t: 0, p: 0 },

        // Semester 6
        { sem: 6, code: 'CS601PC', name: 'Cryptography and Network Security', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 6, code: 'CS602PC', name: 'Deep Learning', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 6, code: 'MB603HS', name: 'Business Economics and Financial Analysis', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 6, code: 'CS612PE', name: 'Professional Elective-II', type: 'elective', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 6, code: 'OE602', name: 'Open Elective-II', type: 'open_elective', credits: 2, l: 2, t: 0, p: 0 },
        { sem: 6, code: 'CS604PC', name: 'Cryptography and Network Security Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 6, code: 'CS605PC', name: 'Deep Learning Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 6, code: 'CS606PC', name: 'Advanced Data Structures using Python Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 6, code: 'EN607HS', name: 'Advanced English Communication Skills Laboratory', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 6, code: 'CS608SC', name: 'Prompt Engineering', type: 'skill', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 6, code: 'MC609', name: 'Gender Sensitization Lab / Human Values and Professional Ethics', type: 'audit', credits: 0, l: 1, t: 0, p: 0 },

        // Semester 7
        { sem: 7, code: 'CS701PC', name: 'Natural Language Processing', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 7, code: 'CS702PC', name: 'Cyber Security', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 7, code: 'MB703HS', name: 'Fundamentals of Management', type: 'core', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 7, code: 'CS713PE', name: 'Professional Elective-III', type: 'elective', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 7, code: 'CS714PE', name: 'Professional Elective-IV', type: 'elective', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 7, code: 'OE703', name: 'Open Elective-III', type: 'open_elective', credits: 2, l: 2, t: 0, p: 0 },
        { sem: 7, code: 'CS704PC', name: 'Natural Language Processing Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 7, code: 'CS705PC', name: 'Cyber Security Lab', type: 'lab', credits: 1, l: 0, t: 0, p: 2 },
        { sem: 7, code: 'CS706PR', name: 'Industry Oriented Mini Project / Summer Internship', type: 'internship', credits: 2, l: 0, t: 0, p: 4 },

        // Semester 8
        { sem: 8, code: 'CS815PE', name: 'Professional Elective-V', type: 'elective', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 8, code: 'CS816PE', name: 'Professional Elective-VI', type: 'elective', credits: 3, l: 3, t: 0, p: 0 },
        { sem: 8, code: 'CS801PR', name: 'Project Work', type: 'project', credits: 14, l: 0, t: 0, p: 28 },
      ];

      const subValues = subjectsData
        .map(
          (s) =>
            `('${syllabusId}'::uuid, ${s.sem}, ${escapeSql(s.code)}, ${escapeSql(s.name)}, '${s.type}', ${s.credits}, ${s.l}, ${s.t}, ${s.p})`
        )
        .join(',\n');

      await prisma.$executeRawUnsafe(`
        INSERT INTO subjects (syllabus_id, semester, code, name, subject_type, credits, lecture_hours, tutorial_hours, practical_hours)
        VALUES ${subValues}
        ON CONFLICT (syllabus_id, semester, name) 
        DO UPDATE SET 
          code = EXCLUDED.code,
          subject_type = EXCLUDED.subject_type,
          credits = EXCLUDED.credits,
          lecture_hours = EXCLUDED.lecture_hours,
          tutorial_hours = EXCLUDED.tutorial_hours,
          practical_hours = EXCLUDED.practical_hours;
      `);
    }
  }

  // 6. Test the RPC function get_student_subjects directly
  console.log('Testing get_subjects_by_academic_selection RPC...');
  // Find a sample JNTUH college
  const testCollege: { id: string; name: string }[] = await prisma.$queryRawUnsafe(`
    SELECT c.id, c.name 
    FROM colleges c 
    JOIN universities u ON c.university_id = u.id 
    WHERE u.name ILIKE '%Hyderabad%'
    LIMIT 1;
  `);

  if (testCollege.length > 0 && cseBranchId) {
    const cid = testCollege[0].id;
    console.log(`Testing with college: ${testCollege[0].name} (${cid}), CSE branch (${cseBranchId}), R25, Sem 1:`);
    const rpcResults: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM get_subjects_by_academic_selection('${cid}'::uuid, '${cseBranchId}'::uuid, 'R25', 1);
    `);
    console.log(`Auto-fetched ${rpcResults.length} subjects for Semester 1:`);
    for (const r of rpcResults) {
      console.log(`  [${r.code}] ${r.name} (${r.subject_type}, ${r.credits} credits)`);
    }
  }

  console.log('--- ACADEMIC CATALOG SEED COMPLETED SUCCESSFULLY ---');
}

seedCatalog()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
