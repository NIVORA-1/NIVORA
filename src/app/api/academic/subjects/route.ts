import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSubjectsBySelection, getStudentSubjects } from '@/lib/academicService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');
    const branchId = searchParams.get('branchId');
    const regulation = searchParams.get('regulation') || 'R25';
    const semesterParam = searchParams.get('semester') || searchParams.get('sem');
    const semester = semesterParam ? parseInt(semesterParam, 10) : 1;

    // Case 1: Specific selection provided (real-time preview or explicit parameters)
    if (collegeId && branchId) {
      const data = await getSubjectsBySelection(collegeId, branchId, regulation, semester);
      return NextResponse.json({
        success: true,
        ...data,
      });
    }

    // Case 2: Logged-in student profile resolution
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized or missing academic selection parameters' }, { status: 401 });
    }

    const data = await getStudentSubjects(user.id, semester);
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Academic subjects API error:', error);
    return NextResponse.json(
      {
        available: false,
        error: 'Failed to fetch academic subjects',
        message: 'Your syllabus is not available yet. Please select another regulation or contact support.',
        subjects: [],
      },
      { status: 500 }
    );
  }
}
