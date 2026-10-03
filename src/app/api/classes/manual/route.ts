import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      dayOfWeek = 1,
      dayName = 'Monday',
      startTime = '09:00 AM',
      endTime = '10:00 AM',
      subjectName,
      subjectCode,
      instructor,
      room,
      type = 'Lecture',
      section,
      subjectId,
      notes,
    } = body;

    if (!subjectName && !subjectCode) {
      return NextResponse.json(
        { error: 'Subject name or subject code is required.' },
        { status: 400 }
      );
    }

    const newClass = await prisma.classSchedule.create({
      data: {
        userId: user.id,
        dayOfWeek: parseInt(String(dayOfWeek), 10) || 1,
        dayName: dayName || 'Monday',
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        subjectName: (subjectName || subjectCode).trim(),
        subjectCode: subjectCode ? subjectCode.trim() : null,
        instructor: instructor ? instructor.trim() : 'TBD',
        room: room ? room.trim() : 'TBD',
        type: type || 'Lecture',
        section: section ? section.trim() : null,
        subjectId: subjectId || null,
        notes: notes ? notes.trim() : null,
        needsReview: false,
      },
    });

    return NextResponse.json({
      success: true,
      classItem: newClass,
      message: 'Class added successfully.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/classes/manual:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add class.' },
      { status: 500 }
    );
  }
}
