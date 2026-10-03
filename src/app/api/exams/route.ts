import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getStudentSubjects } from '@/lib/academicService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // 1. Fetch only real exams belonging to the authenticated user
    const exams = await prisma.exam.findMany({
      where: { userId: user.id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            instructor: true,
            room: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    // 2. Fetch existing subjects available to this user (for dropdowns / matching)
    const existingSubjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
        instructor: true,
        room: true,
      },
      orderBy: { name: 'asc' },
    });

    // Also enrich with student's academic curriculum subjects if available
    try {
      const academicData = await getStudentSubjects(user.id);
      if (academicData?.available && Array.isArray(academicData.subjects)) {
        for (const acSub of academicData.subjects) {
          const exists = existingSubjects.some(
            (s) => s.id === acSub.id || (s.code && s.code.toLowerCase() === acSub.code.toLowerCase())
          );
          if (!exists) {
            existingSubjects.push({
              id: acSub.id,
              name: acSub.name,
              code: acSub.code,
              color: '#8fc5a7',
              instructor: 'TBD',
              room: 'TBD',
            });
          }
        }
      }
    } catch (e) {
      console.warn('[Exams API] Academic subjects lookup skipped:', e);
    }

    return NextResponse.json({
      exams,
      subjects: existingSubjects,
    });
  } catch (error) {
    console.error('[Exams API] GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve exams.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      subjectId,
      examType = 'Mid-Term',
      date,
      startTime = '',
      endTime = '',
      room = '',
      notes = '',
      title,
    } = body;

    if (!date) {
      return NextResponse.json({ error: 'Exam date is required.' }, { status: 400 });
    }

    // Verify subject if provided
    let verifiedSubjectId: string | null = null;
    let subjectName = '';
    let subjectCode = '';

    if (subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
      });
      if (subject) {
        verifiedSubjectId = subject.id;
        subjectName = subject.name;
        subjectCode = subject.code;
      }
    }

    // Generate or format title
    const examTitle =
      title ||
      (subjectCode
        ? `${subjectCode}: ${examType} Examination`
        : subjectName
        ? `${subjectName}: ${examType} Examination`
        : `${examType} Examination`);

    // Parse date cleanly
    const examDate = new Date(date);
    if (isNaN(examDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
    }

    const createdExam = await prisma.exam.create({
      data: {
        userId: user.id,
        subjectId: verifiedSubjectId,
        title: examTitle,
        examType: examType || 'Mid-Term',
        date: examDate,
        startTime: startTime || '09:30 AM',
        endTime: endTime || null,
        room: room || null,
        notes: notes || null,
        status: 'upcoming',
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            instructor: true,
            room: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      exam: createdExam,
    });
  } catch (error) {
    console.error('[Exams API] POST error:', error);
    return NextResponse.json({ error: 'Failed to create exam record.' }, { status: 500 });
  }
}
