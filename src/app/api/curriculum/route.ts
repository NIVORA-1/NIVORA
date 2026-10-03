import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getStudentSubjects, getSubjectsBySelection } from '@/lib/academicService';
import { getCurriculumSubjects, getAvailableSemesters } from '@/lib/curriculumData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);

    // Profile defaults if user is logged in
    const profileSemester = user?.profile?.semester || 1;

    // Query parameters override if provided
    const requestedSemesterParam = searchParams.get('semester') || searchParams.get('sem');
    const selectedSemester = requestedSemesterParam
      ? parseInt(requestedSemesterParam, 10)
      : profileSemester;

    const collegeId = searchParams.get('collegeId') || user?.profile?.collegeId;
    const branchId = searchParams.get('branchId') || user?.profile?.branchId;
    const regulation = searchParams.get('regulation') || user?.profile?.regulation || 'R25';

    // If student has database academic profile or params supplied
    if (collegeId && branchId) {
      const dbResult = await getSubjectsBySelection(collegeId, branchId, regulation, selectedSemester);
      if (dbResult.available && dbResult.subjects.length > 0) {
        return NextResponse.json({
          degree: user?.profile?.degree || 'B.Tech',
          branch: dbResult.branchName || user?.profile?.stream || 'Computer Science & Engineering',
          selectedSemester,
          profileSemester,
          availableSemesters: [1, 2, 3, 4, 5, 6, 7, 8],
          totalSubjects: dbResult.subjects.length,
          subjects: dbResult.subjects.map((s) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            type: s.subjectType.charAt(0).toUpperCase() + s.subjectType.slice(1),
            credits: s.credits,
            description: `${s.name} under ${s.regulation || regulation} curriculum (${s.academicYear || 'Current'}).`,
            lectureHours: s.lectureHours,
            tutorialHours: s.tutorialHours,
            practicalHours: s.practicalHours,
          })),
          academicMeta: {
            collegeName: dbResult.collegeName,
            universityName: dbResult.universityName,
            regulation: dbResult.regulation,
            academicYear: dbResult.academicYear,
          },
        });
      }
    }

    if (user) {
      const studentResult = await getStudentSubjects(user.id, selectedSemester);
      if (studentResult.available && studentResult.subjects.length > 0) {
        return NextResponse.json({
          degree: user.profile?.degree || 'B.Tech',
          branch: studentResult.branchName || user.profile?.stream || 'Computer Science & Engineering',
          selectedSemester,
          profileSemester,
          availableSemesters: [1, 2, 3, 4, 5, 6, 7, 8],
          totalSubjects: studentResult.subjects.length,
          subjects: studentResult.subjects.map((s) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            type: s.subjectType.charAt(0).toUpperCase() + s.subjectType.slice(1),
            credits: s.credits,
            description: `${s.name} under ${s.regulation || 'Official'} curriculum (${s.academicYear || 'Current'}).`,
            lectureHours: s.lectureHours,
            tutorialHours: s.tutorialHours,
            practicalHours: s.practicalHours,
          })),
          academicMeta: {
            collegeName: studentResult.collegeName,
            universityName: studentResult.universityName,
            regulation: studentResult.regulation,
            academicYear: studentResult.academicYear,
          },
        });
      }
    }

    // Fallback to static model curriculum
    const degree = searchParams.get('degree') || user?.profile?.degree || 'B.Tech';
    const branch = searchParams.get('branch') || user?.profile?.streamCode || 'CSE';

    const subjects = getCurriculumSubjects(degree, branch, selectedSemester);
    const availableSemesters = getAvailableSemesters(degree, branch);

    return NextResponse.json({
      degree,
      branch,
      selectedSemester,
      profileSemester,
      availableSemesters,
      totalSubjects: subjects.length,
      subjects,
    });
  } catch (error) {
    console.error('Curriculum GET API error:', error);
    return NextResponse.json({ error: 'Failed to load curriculum' }, { status: 500 });
  }
}
