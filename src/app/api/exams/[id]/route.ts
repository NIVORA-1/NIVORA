import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Exam ID is required.' }, { status: 400 });
    }

    // Ensure the exam belongs to the authenticated user
    const existing = await prisma.exam.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Exam not found or unauthorized.' }, { status: 404 });
    }

    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Exam deleted successfully.' });
  } catch (error) {
    console.error('[Exams API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete exam.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const existing = await prisma.exam.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Exam not found or unauthorized.' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (body.subjectId !== undefined) updateData.subjectId = body.subjectId;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.examType !== undefined) updateData.examType = body.examType;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;
    if (body.room !== undefined) updateData.room = body.room;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        subject: true,
      },
    });

    return NextResponse.json({ success: true, exam: updated });
  } catch (error) {
    console.error('[Exams API] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update exam.' }, { status: 500 });
  }
}
