import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export interface ConfirmedExamItem {
  id?: string;
  subjectCode?: string;
  subjectName?: string;
  examType: string;
  date: string; // "YYYY-MM-DD"
  startTime?: string | null;
  endTime?: string | null;
  room?: string | null;
  notes?: string | null;
  subjectId?: string | null;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const { entries, mode = 'append' } = body as {
      entries: ConfirmedExamItem[];
      mode?: 'replace' | 'append';
    };

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'No confirmed exam entries provided.' },
        { status: 400 }
      );
    }

    const savedExams = await prisma.$transaction(async (tx) => {
      // If replace mode, clear previous exams for this user
      if (mode === 'replace') {
        await tx.exam.deleteMany({
          where: { userId: user.id },
        });
      }

      // Fetch all existing subjects
      const existingSubjects = await tx.subject.findMany();

      const created = [];

      for (const entry of entries) {
        if (!entry.date) continue;

        // Verify subject association
        let verifiedSubjectId: string | null = null;
        let displayName = entry.subjectName || '';
        let displayCode = entry.subjectCode || '';

        if (entry.subjectId) {
          const matched = existingSubjects.find((s) => s.id === entry.subjectId);
          if (matched) {
            verifiedSubjectId = matched.id;
            displayName = displayName || matched.name;
            displayCode = displayCode || matched.code;
          }
        }

        const examType = entry.examType || 'Mid-Term';
        const title = displayCode
          ? `${displayCode}: ${examType} Examination`
          : displayName
          ? `${displayName}: ${examType} Examination`
          : `${examType} Examination`;

        const examDate = new Date(entry.date);
        if (isNaN(examDate.getTime())) continue;

        const newExam = await tx.exam.create({
          data: {
            userId: user.id,
            subjectId: verifiedSubjectId,
            title,
            examType,
            date: examDate,
            startTime: entry.startTime || '09:30 AM',
            endTime: entry.endTime || null,
            room: entry.room || null,
            notes: entry.notes || null,
            status: 'upcoming',
          },
          include: {
            subject: true,
          },
        });

        created.push(newExam);
      }

      return created;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully scheduled ${savedExams.length} exam(s).`,
      exams: savedExams,
    });
  } catch (error: any) {
    console.error('[Exam Confirm API] Error saving exams:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save confirmed exams.' },
      { status: 500 }
    );
  }
}
