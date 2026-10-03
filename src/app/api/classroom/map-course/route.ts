import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      googleCourseId,
      subjectId,
      createNewSubject,
      subjectName,
      subjectCode,
    } = body as {
      googleCourseId: string;
      subjectId?: string;
      createNewSubject?: boolean;
      subjectName?: string;
      subjectCode?: string;
    };

    if (!googleCourseId) {
      return NextResponse.json({ error: 'googleCourseId is required.' }, { status: 400 });
    }

    let finalSubjectId: string | null = subjectId || null;

    // Handle creating a new subject if requested
    if (createNewSubject && subjectName) {
      const code = (subjectCode || subjectName.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'SUB').trim();

      // Check if code already exists
      const existing = await prisma.subject.findUnique({
        where: { code },
      });

      if (existing) {
        finalSubjectId = existing.id;
      } else {
        const created = await prisma.subject.create({
          data: {
            name: subjectName.trim(),
            code,
            instructor: 'Google Classroom Faculty',
            room: 'Virtual Classroom',
            credits: 3.0,
          },
        });
        finalSubjectId = created.id;
      }
    }

    if (!finalSubjectId) {
      return NextResponse.json(
        { error: 'Please select an existing subject or provide a new subject name.' },
        { status: 400 }
      );
    }

    // 1. Update the course mapping
    await prisma.googleClassroomCourse.update({
      where: {
        userId_googleCourseId: {
          userId: user.id,
          googleCourseId,
        },
      },
      data: {
        nivoraSubjectId: finalSubjectId,
      },
    });

    // 2. Cascade update to all imported assignments for this course
    await prisma.assignment.updateMany({
      where: {
        userId: user.id,
        source: 'google_classroom',
        externalCourseId: googleCourseId,
      },
      data: {
        subjectId: finalSubjectId,
      },
    });

    return NextResponse.json({
      success: true,
      mappedSubjectId: finalSubjectId,
      message: 'Course mapping saved successfully.',
    });
  } catch (error: any) {
    console.error('Error in /api/classroom/map-course:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to map Google Classroom course.' },
      { status: 500 }
    );
  }
}
