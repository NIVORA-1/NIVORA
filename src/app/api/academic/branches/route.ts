import { NextResponse } from 'next/server';
import { getCollegeBranches, getCollegeById } from '@/lib/academicService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'collegeId query parameter is required' }, { status: 400 });
    }

    const [college, branches] = await Promise.all([
      getCollegeById(collegeId),
      getCollegeBranches(collegeId),
    ]);

    if (!college) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      college,
      university: {
        id: college.universityId,
        name: college.universityName,
      },
      count: branches.length,
      branches,
    });
  } catch (error) {
    console.error('Academic branches API error:', error);
    return NextResponse.json({ error: 'Failed to load college branches' }, { status: 500 });
  }
}
